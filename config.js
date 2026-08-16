// ============================================================================
// PUBLIC CONFIG — safe to edit freely. Nothing in this file is secret.
// Secrets (PayPal Client Secret, Apps Script URL) go in .env instead — see
// .env.example. This file is read by server.js and exposed to the browser
// via GET /api/config, so main.js can render prices/copy without a rebuild.
// ============================================================================

module.exports = {
  // ---------- Book & brand ----------
  BOOK_TITLE: "The Gluten-Free Kitchen",
  BOOK_SUBTITLE: "125+ Foolproof Recipes, Meal Plans & Real-Life Techniques for Everyday Gluten-Free Cooking and Baking",
  AUTHOR_NAME: "Sarah Mitchell",
  AUTHOR_TITLE: "Celiac Advocate & Gluten-Free Culinary Educator",
  SITE_URL: "https://your-app-name.onrender.com",     // <-- set after first Render deploy
  SUPPORT_EMAIL: "support@yourdomain.com",              // <-- shown in footer & FAQs
  COMPANY_NAME: "Sarah Mitchell",                        // <-- for copyright line

  // ---------- Pricing ----------
  CURRENCY: "USD",
  ORIGINAL_PRICE: 24.99,     // shown struck-through
  SALE_PRICE: 14.99,          // the real PayPal charge amount
  DISCOUNT_ACTIVE: true,      // false = hide the strike-through / badge entirely
  DISCOUNT_LABEL: "Launch Week Price — 40% Off",

  // Optional countdown banner (set COUNTDOWN_ACTIVE:false to hide it entirely)
  COUNTDOWN_ACTIVE: true,
  COUNTDOWN_END_ISO: "2026-09-01T23:59:59-07:00", // ISO date-time, any timezone offset

  // ---------- What buyers get (rendered as the feature grid) ----------
  DELIVERABLES: [
    { icon: "📘", title: "125+ Tested Recipes", text: "Breakfast, lunch, dinner, baking, and snacks — every one built for real weeknights." },
    { icon: "🧪", title: "The Science, Explained", text: "Understand why gluten-free flour behaves differently, so you can fix it when it doesn't." },
    { icon: "🗂️", title: "13 Printable Toolkits", text: "Pantry audits, a 30-day meal planner, a recipe adaptation worksheet, and more." },
    { icon: "🛒", title: "Shopping & Budget Systems", text: "The five-zone grocery method, cost-per-serving thinking, and a real food budget tracker." },
    { icon: "✈️", title: "Eating Out & Travel Guides", text: "Restaurant scripts, cross-contact checklists, and a full travel food system." },
    { icon: "📄", title: "Instant PDF + EPUB Download", text: "Read on any device, print the toolkit pages, keep it forever." },
  ],

  // ---------- FAQs ----------
  FAQS: [
    { q: "What format do I get?", a: "You'll receive an instant digital download link on the Thank You page right after checkout — a PDF and EPUB file of the full book, formatted for reading on any device or for printing at home." },
    { q: "Is this a subscription?", a: "No. This is a one-time purchase. You pay once and own the book — no recurring charges, ever." },
    { q: "I'm newly diagnosed with celiac disease — is this beginner-friendly?", a: "Yes. Part One is built specifically for total beginners: what gluten actually is, how to stock your first pantry, and a guided first seven days. You don't need any prior cooking experience." },
    { q: "Does this book include a refund or return policy?", a: "Because this is an instant-access digital product, all sales are final once the download link has been issued. Please see the full policy in the footer before purchasing." },
    { q: "Can I print the worksheets and toolkits?", a: "Yes — the 13-tool appendix is specifically designed to be printed and used as a physical reference in your kitchen." },
    { q: "How is my download link protected?", a: "Your download link is personal to your order and expires after first use, so please save the file to your device as soon as you download it." },
    { q: "Is this medical or dietary advice?", a: "No. This book is an educational and culinary resource, not a substitute for professional medical advice. Please see the full disclaimer in the footer." },
  ],

  // ---------- Reviews — REPLACE with real reader feedback before launch ----------
  // See README.md: do not present fabricated reviews as real customers.
  REVIEWS: [
    { name: "Ashley, USA", detail: "Diagnosed 2024", quote: "The meal-planning approach makes the whole week feel much more manageable.", rating: 5 },
    { name: "James, UK", detail: "Parent of a celiac child", quote: "I love having the recipes and kitchen reference material together in one place.", rating: 5 },
    { name: "Nathan, Australia", detail: "Home baker", quote: "The printable tools are exactly the kind of practical extras I actually use.", rating: 4 },
  ],
};
