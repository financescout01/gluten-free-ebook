# The Gluten-Free Kitchen — Landing Page System

This is a complete, self-hosted sales system: landing page + PayPal checkout +
expiring one-time download link + buyer mailing list, built to run **free**
on Render (Node.js web service) with **Google Sheets** as your database.

## What's in this project

```
landing/
├── server.js                 Node/Express backend (payment + download logic)
├── package.json
├── .env.example               Copy to .env — put your real secrets here
├── config.js                  Public settings (price, discount, copy) — edit this freely
├── public/
│   ├── index.html              The landing page
│   ├── thankyou.html           Post-payment page with the download button
│   ├── css/style.css
│   ├── js/main.js              Landing page interactivity + PayPal buttons
│   ├── js/thankyou.js          Download-link logic
│   └── images/                 Drop your generated images here (see IMAGE_PROMPTS.md)
├── apps-script/Code.gs         Paste into Google Apps Script — this IS your database
├── IMAGE_PROMPTS.md            Every image the page needs, with generation prompts
├── VIDEO_PROMPT.md             UGC-style video script + generation prompt
└── DEPLOY.md                   Step-by-step: Google Sheet → PayPal → Render
```

## Honest things you should know before you launch

1. **On reviews:** You asked for a reviews section, and it's built — but I have not
   filled it with fake five-star reviews attributed to invented customers. That's
   deceptive advertising (FTC endorsement guidelines cover this) and it's the kind
   of thing that gets accounts suspended once discovered. The section ships with
   clearly marked placeholders. Fill it with **real** feedback from beta readers,
   ARC reviewers, or early buyers — even 3–4 genuine ones will outperform ten fake
   ones, because real reviews read differently and people can usually tell.

2. **On the "UGC video":** I've written this as an authentic **author welcome/intro
   video** filmed in casual, UGC-style (phone camera, talking to camera) rather than
   as a fake "customer testimonial," for the same reason as above — an uncompensated
   customer testimonial that didn't happen is a false claim. An author intro filmed
   in that same authentic style is honest and, frankly, converts just as well.

3. **On download protection:** The one-time link genuinely expires after first use
   (enforced server-side via the Google Sheet). What it *can't* do is stop someone
   from re-sharing the file itself after downloading — no low-cost system can. This
   is standard for indie ebook sales; don't oversell it as piracy-proof anywhere in
   your marketing.

4. **On "No Return Policy":** Digital goods are normally sold as all-sales-final,
   and the footer says so — but PayPal's own Buyer Protection policy can still let
   a buyer open a dispute regardless of your stated policy. Stating it clearly is
   still the right move; it just isn't a legal shield against PayPal disputes.

Everything else below is ready to configure and deploy.
