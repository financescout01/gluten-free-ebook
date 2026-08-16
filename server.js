// ============================================================================
// SERVER.JS — the whole backend lives here. Sections are labeled so you can
// find things fast:
//   1. Setup
//   2. Public config endpoint (feeds main.js)
//   3. PayPal helpers (get access token, create order, capture order)
//   4. POST /api/create-order      — called when buyer clicks the PayPal button
//   5. POST /api/capture-order     — called after buyer approves payment
//   6. GET  /api/check-download    — thankyou.html polls this
//   7. GET  /download/:token       — the actual one-time file download
// ============================================================================

require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const path = require("path");
const publicConfig = require("./config");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE,          // "sandbox" | "live"
  GOOGLE_SHEET_WEBAPP_URL,
  BOOK_FILE_ID,
  PORT,
} = process.env;

const PAYPAL_BASE =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// ============================================================================
// 2. PUBLIC CONFIG — main.js fetches this on page load to render prices/copy.
//    Only non-secret fields from config.js are exposed here, plus the
//    PayPal Client ID (client IDs are meant to be public; the SECRET never is).
// ============================================================================
app.get("/api/config", (req, res) => {
  res.json({
    ...publicConfig,
    PAYPAL_CLIENT_ID, // safe to expose — required by the PayPal JS SDK
  });
});

// ============================================================================
// 3. PAYPAL HELPERS
// ============================================================================
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!resp.ok) throw new Error("PayPal auth failed: " + (await resp.text()));
  const data = await resp.json();
  return data.access_token;
}

// ============================================================================
// 4. CREATE ORDER — buyer clicked "Buy Now". We create the order SERVER-SIDE
//    (never trust a price sent from the browser) using the price in config.js.
// ============================================================================
app.post("/api/create-order", async (req, res) => {
  try {
    const accessToken = await getPayPalAccessToken();
    const amount = publicConfig.DISCOUNT_ACTIVE
      ? publicConfig.SALE_PRICE
      : publicConfig.ORIGINAL_PRICE;

    const resp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: publicConfig.BOOK_TITLE,
            amount: {
              currency_code: publicConfig.CURRENCY,
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    const order = await resp.json();
    if (!resp.ok) throw new Error(JSON.stringify(order));
    res.json({ id: order.id });
  } catch (err) {
    console.error("create-order error:", err.message);
    res.status(500).json({ error: "Could not create PayPal order." });
  }
});

// ============================================================================
// 5. CAPTURE ORDER — buyer approved payment in the PayPal popup. We confirm
//    the charge actually completed, then:
//      a) generate a random one-time download token
//      b) log the buyer + token to your Google Sheet (this is your mailing list)
//      c) return the token to the browser, which redirects to /thankyou.html?token=...
// ============================================================================
app.post("/api/capture-order", async (req, res) => {
  try {
    const { orderID, buyerName, buyerEmail } = req.body;
    if (!orderID) return res.status(400).json({ error: "Missing orderID" });

    const accessToken = await getPayPalAccessToken();
    const resp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const capture = await resp.json();

    const completed =
      resp.ok && capture.status === "COMPLETED";
    if (!completed) {
      console.error("Capture not completed:", JSON.stringify(capture));
      return res.status(400).json({ error: "Payment was not completed." });
    }

    // Pull useful details out of the PayPal response for the sheet log
    const payer = capture.payer || {};
    const unit = (capture.purchase_units || [])[0] || {};
    const captureDetails = (unit.payments && unit.payments.captures && unit.payments.captures[0]) || {};
    const amountPaid = captureDetails.amount ? captureDetails.amount.value : "";

    const token = crypto.randomBytes(24).toString("hex");

    await logToSheet({
      action: "log_buyer",
      timestamp: new Date().toISOString(),
      name: buyerName || `${payer.name?.given_name || ""} ${payer.name?.surname || ""}`.trim(),
      email: buyerEmail || payer.email_address || "",
      orderID,
      amountPaid,
      token,
      used: "FALSE",
    });

    res.json({ success: true, token });
  } catch (err) {
    console.error("capture-order error:", err.message);
    res.status(500).json({ error: "Could not capture PayPal payment." });
  }
});

// ============================================================================
// 6. CHECK DOWNLOAD STATUS — thankyou.html calls this to show a friendly
//    "link already used" message instead of just failing silently.
// ============================================================================
app.get("/api/check-download", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ valid: false });
    const result = await checkTokenInSheet(token);
    res.json(result); // { valid: true/false, used: true/false }
  } catch (err) {
    console.error("check-download error:", err.message);
    res.status(500).json({ valid: false });
  }
});

// ============================================================================
// 7. DOWNLOAD — the one-time link itself. Validates the token against the
//    Google Sheet, marks it used, then redirects to the actual file. Because
//    the real Google Drive file ID lives only in .env, buyers never see it
//    directly in the page source.
// ============================================================================
app.get("/download/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const status = await checkTokenInSheet(token);

    if (!status.valid) {
      return res.status(404).send(expiredPage("This download link isn't valid."));
    }
    if (status.used) {
      return res.status(410).send(expiredPage("This download link has already been used."));
    }

    await logToSheet({ action: "mark_used", token });

    const directUrl = `https://drive.google.com/uc?export=download&id=${BOOK_FILE_ID}`;
    res.redirect(directUrl);
  } catch (err) {
    console.error("download error:", err.message);
    res.status(500).send(expiredPage("Something went wrong. Please contact support."));
  }
});

function expiredPage(message) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Link unavailable</title>
  <style>body{font-family:Georgia,serif;background:#FBF6EE;color:#2B2420;text-align:center;padding:80px 20px}
  h1{color:#8A5A34}a{color:#8A5A34}</style></head><body>
  <h1>⚠ ${message}</h1>
  <p>Each download link can only be used once. If you believe this is an error,
  please contact <a href="mailto:${publicConfig.SUPPORT_EMAIL}">${publicConfig.SUPPORT_EMAIL}</a>
  with your PayPal order ID.</p></body></html>`;
}

// ============================================================================
// GOOGLE SHEET HELPERS — every read/write goes through your Apps Script Web
// App (see apps-script/Code.gs). The sheet IS the database.
// ============================================================================
async function logToSheet(payload) {
  if (!GOOGLE_SHEET_WEBAPP_URL) {
    console.warn("GOOGLE_SHEET_WEBAPP_URL not set — skipping sheet log.");
    return;
  }
  await fetch(GOOGLE_SHEET_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function checkTokenInSheet(token) {
  if (!GOOGLE_SHEET_WEBAPP_URL) return { valid: false, used: false };
  const resp = await fetch(
    `${GOOGLE_SHEET_WEBAPP_URL}?action=check_token&token=${encodeURIComponent(token)}`
  );
  return resp.json(); // { valid: true/false, used: true/false }
}

// ============================================================================
app.listen(PORT || 3000, () => {
  console.log(`Server running on port ${PORT || 3000}`);
});
