# Deploy Guide — Google Sheet → PayPal → Render (all free)

Follow these in order. Total time: roughly 45–60 minutes the first time.

---

## STEP 1 — Google Sheet (your buyer database)

1. Go to [sheets.google.com](https://sheets.google.com) → create a **new blank sheet**.
2. Rename the tab at the bottom to `Sheet1` (or note whatever it's called —
   you'll put that name in `Code.gs`).
3. In row 1, type these column headers exactly, one per cell:
   `Timestamp | Name | Email | OrderID | AmountPaid | Token | Used`
4. Go to **Extensions → Apps Script**. Delete the placeholder `myFunction()`
   code, and paste in the entire contents of `apps-script/Code.gs` from this
   project.
5. At the top of the pasted code, edit the `CONFIG` block:
   - `SITE_URL` → you won't have this yet on the first pass — leave the
     placeholder, you'll come back and update it after Step 4.
   - `SUPPORT_EMAIL`, `FROM_NAME`, `BOOK_TITLE` → fill in your real details.
6. Click **Deploy → New deployment**.
   - Click the gear icon → select type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**. Google will ask you to authorize — approve it (it's
     your own script, this is expected).
7. Copy the **Web app URL** it gives you (ends in `/exec`). This is your
   `GOOGLE_SHEET_WEBAPP_URL` — save it somewhere for Step 4.

**This Google Sheet is now your buyer database and mailing list** — every
purchase appends a row automatically. Export it to CSV anytime from
File → Download, or connect it to Mailchimp/any email tool later.

---

## STEP 2 — Your book file

1. Upload your final book PDF (and/or EPUB) to Google Drive.
2. Right-click the file → **Share** → change access to **"Anyone with the
   link"** (Viewer).
3. Copy the file's ID out of its share link:
   `https://drive.google.com/file/d/`**`THIS_PART_IS_THE_ID`**`/view`
4. Save that ID — it's your `BOOK_FILE_ID` for Step 4.

*(Buyers never see this Drive link — the server proxies the download
through your one-time token URL instead.)*

---

## STEP 3 — PayPal

1. Go to [developer.paypal.com](https://developer.paypal.com) → log in with
   your normal PayPal account → **Apps & Credentials**.
2. Make sure you're in **Sandbox** mode first (top toggle) — test everything
   before going live.
3. Click **Create App**, name it anything (e.g. "Gluten-Free Kitchen").
4. Copy the **Client ID** and **Secret** shown — these are your
   `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` for Step 4.
5. When you're ready to accept real payments later, flip the toggle to
   **Live**, create a live app the same way, and swap in the live
   credentials + set `PAYPAL_MODE=live`.

---

## STEP 4 — Configure the project

1. In this project folder, copy `.env.example` to a new file named `.env`.
2. Fill in every value using what you collected in Steps 1–3:
   ```
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_MODE=sandbox
   GOOGLE_SHEET_WEBAPP_URL=...
   BOOK_FILE_ID=...
   PORT=3000
   ```
3. Open `config.js` and edit the public-facing fields — price, discount,
   author name, FAQs, etc. (Every field is commented — see that file directly.)
4. **Replace the placeholder reviews** in `config.js` → `REVIEWS` with real
   feedback before you launch (see README.md for why this matters).

### Test locally (optional but recommended)
```bash
npm install
npm start
```
Visit `http://localhost:3000`. Use a [PayPal sandbox test buyer account]
(developer.paypal.com → Sandbox → Accounts) to run a full test purchase
end-to-end, and confirm a row appears in your Google Sheet.

---

## STEP 5 — Push to GitHub

Render deploys from a GitHub repo.

1. Create a new repo on GitHub (private is fine).
2. **Do not commit your `.env` file** — it's already listed in the
   `.gitignore` below; double check it's ignored.
3. Push this whole project folder to that repo.

```bash
git init
git add .
git commit -m "Initial landing page"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## STEP 6 — Deploy to Render (free)

1. Go to [render.com](https://render.com) → sign up/log in (GitHub login is easiest).
2. **New → Web Service** → connect your GitHub repo.
3. Settings:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Under **Environment Variables**, add every value from your `.env` file
   one by one (Render does not read your local `.env` file — you re-enter
   them here in the dashboard).
5. Click **Create Web Service**. Wait for the build/deploy to finish (a
   few minutes).
6. Render gives you a live URL like `https://your-app-name.onrender.com`.

### Now go back and fix the two placeholder URLs:
- In `config.js` → `SITE_URL`, put your real Render URL, commit, and push
  again (Render auto-redeploys on push).
- In your Google Apps Script `CONFIG.SITE_URL` (Step 1), update it to the
  same URL, save, and **Deploy → Manage deployments → Edit → New version**
  so the change takes effect.

**Note on Render's free tier:** the free instance "sleeps" after 15 minutes
of no traffic and takes ~30–60 seconds to wake up on the next visit. For a
low-to-medium traffic book launch this is usually fine; if it becomes an
issue, Render's cheapest paid tier ($7/mo) removes the sleep entirely.

---

## STEP 7 — Full end-to-end test

1. Visit your live Render URL.
2. Make a real purchase using a PayPal **sandbox** buyer account (while
   `PAYPAL_MODE=sandbox`).
3. Confirm:
   - You land on `/thankyou.html` with a working download button
   - The file downloads correctly
   - Clicking the same link again shows "already used"
   - A new row appeared in your Google Sheet
   - You received the backup email (check spam folder too)

---

## STEP 8 — Go live

1. Swap in your **live** PayPal credentials and set `PAYPAL_MODE=live` in
   Render's environment variables.
2. Add your real images (`IMAGE_PROMPTS.md`) and video (`VIDEO_PROMPT.md`)
   into `public/images/` and `public/videos/`, commit, push.
3. Replace the placeholder reviews in `config.js`.
4. Set your real `COUNTDOWN_END_ISO` date if using the discount timer.
5. Do one final **real** $1-equivalent test purchase yourself if you can,
   to confirm live mode works end to end, then you're ready to share the link.

---

## Optional: custom domain
Render supports free custom domains on the free tier — under your service
→ **Settings → Custom Domains**, add your domain and point its DNS per
Render's instructions. This just changes the URL people see; remember to
update `SITE_URL` in both `config.js` and `Code.gs` again if you do this.
