# IT Handoff — Acquired Financial Services landing pages

A short, action-focused checklist for your developer. The full deploy guide is in [README.md](README.md) — this is the "do these things in this order" version.

---

## 1. Get the code

Either:
- **Clone the repo:** `git clone git@github.com:25-05-2026/af-landing-pages.git`
- **Download a ZIP:** go to https://github.com/25-05-2026/af-landing-pages → green "Code" button → "Download ZIP"

Live preview (hosted on GitHub Pages so you can see what the result should look like): https://25-05-2026.github.io/af-landing-pages/

---

## 2. The files

| File | What it is |
|------|------------|
| `car-finance.html` | Retail car / lifestyle asset landing page |
| `abn-business-finance.html` | Business / ABN asset finance landing page |
| `personal-loans.html` | Personal loans landing page (chatbot embedded in the hero fold) |
| `enquiry-form.html` | Multi-step eligibility chatbot with live ABR ABN+name lookup and preset support. All CTAs across the three landing pages link here. |
| `thank-you.html` | Post-submit confirmation page. Google Ads conversion fires here. |
| `branding/` | Logos, badges, hero images (hero-car.webp, hero-commercial.webp, hero-personal.webp) |
| `lenders/` | 51 lender PNG logos used by the scrolling strip |
| `mobile-preview.html` | A tool, not for production. Loads each page in a phone-frame iframe for design review. |
| `README.md` | Full deploy guide with every detail |

---

## 3. Install on WordPress (pick ONE approach)

### Recommended: Elementor Canvas page templates

1. In WordPress: **Pages → Add New** for each of the five pages:
   - "Car Finance" (slug: `/car-finance`)
   - "Commercial Finance" (slug: `/commercial-finance`)
   - "Personal Loans" (slug: `/personal-loans`)
   - "Enquiry Form" (slug: `/enquiry-form`) — the chatbot
   - "Thank You" (slug: `/thank-you`)
2. For each page set **Page Attributes → Template = Elementor Canvas**
   *This removes the theme header/footer, important for Google Ads quality score.*
3. In Elementor for each page, drag in an **HTML widget** and paste the entire `<body>...</body>` contents of the corresponding `.html` file.
4. Put the `<style>` and `<script>` blocks from each file's `<head>` into **Elementor → Site Settings → Custom CSS** (for the styles) plus a separate **HTML widget at the top of the page** (for the JS + Schema.org JSON-LD).

### Alternative: custom theme page templates

Create `wp-content/themes/your-theme/page-{slug}.php` for each:

```php
<?php /* Template Name: Personal Loans Landing */ ?>
<!-- paste the full contents of personal-loans.html here -->
```

Then create Pages and pick the template under **Page Attributes**.

### Either way — upload the static assets

The HTML files reference these folders with relative paths:

- `/branding/` (hero images, logos, badges — around 1.5MB)
- `/lenders/` (51 files, around 600KB)

Upload them to **the same folder** as the HTML pages so relative paths still resolve. Either via FTP/SFTP into `wp-content/uploads/landing-pages/` and update the paths in HTML, OR easier, upload through Elementor's media library and let WordPress track them.

---

## 4. Update inter-page links

> **How the form works:** all three landing pages (car, commercial, personal loans) embed the `enquiry-form.html` chatbot directly in the hero fold via an iframe, so the visitor can start answering questions without scrolling or clicking. All CTA buttons further down the page also open the same chatbot in a popup overlay. On submit, the parent navigates to `thank-you.html`.
>
> Car and commercial also show a "Today's Best Rate" glass tile beside the chatbot — purely visual, no logic required.
>
> Personal loans does NOT show a rate tile (personal loan rates are credit-score priced, so a single advertised rate would set the wrong expectation). Instead, every CTA on personal-loans.html passes `?preset=personal-loan` to the chatbot, which skips the asset-type and entity questions and sets the loan minimum to $5,000 (vs the $20,000 default on the asset-finance pages).
>
> `enquiry-form.html` must still be deployed as a real page — it's both the iframe target and the fallback for JS-disabled visitors.

Once the WordPress slugs are decided, search & replace across all five HTML files **before pasting into WordPress**:

| Find | Replace with |
|------|--------------|
| `enquiry-form.html` | `/enquiry-form` |
| `thank-you.html` | `/thank-you` |
| `car-finance.html` | `/car-finance` |
| `abn-business-finance.html` | `/commercial-finance` |
| `personal-loans.html` | `/personal-loans` |

Skip this if you keep the `.html` suffixes. The `?embed=1`, `?preset=personal-loan`, `?variant=hero` and `?gclid=…` parameters the popup appends to the iframe URL are all handled inside `enquiry-form.html` automatically — no change needed.

---

## 5. Wire the chatbot to Google Forms (CRITICAL — the form doesn't submit anywhere yet)

In `enquiry-form.html`, search for `GOOGLE_FORM_ID` (near the bottom of the script block). Two things to do:

### a) Build a Google Form

Create a Google Form with one question per field. The full list of fields is in **README §4**. The order doesn't matter — only the entry IDs do.

### b) Plug in the form URL + entry IDs

Replace:
```javascript
const GOOGLE_FORM_ID = 'REPLACE_FORM_ID';
const FIELD_MAP = {
  firstName: 'entry.100100100',
  // ...all the entry.XXX IDs
};
```

With your actual Google Form ID and the entry IDs from the form's HTML source (or its "Get pre-filled link" output). README §4 step 2 explains how to find them.

### c) Hook the Google Form to a Sheet (and optionally a CRM)

In the form: **Responses → Link to Sheets**. Every submission lands as a row. Add a Zapier/Make trigger on new responses to push into Ambition / Slack / email if needed.

---

## 6. Wire Google Ads conversion tracking (CRITICAL — campaigns can't optimise without this)

The same conversion ID block sits at the top of `<head>` in all five files, currently commented out:

```html
<!-- <script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXXX');
</script> -->
```

Uncomment it, replace `AW-XXXXXXXXXX` with the real Google Ads ID. Then in `enquiry-form.html` and `thank-you.html`, search for `AW-XXXXXXXXXX/AAAAAAAA` and replace with the real `AW-id/conversion-label` per README §5.

If using GTM instead of direct gtag: skip the inline block, add the GTM container snippet to all five files' `<head>`, and trigger the conversion from a custom event on `thank-you.html`.

---

## 7. Things that are ALREADY wired

So you don't need to touch them:

- **Schema.org JSON-LD** for FinancialService + FAQPage (in the `<head>` of each landing page)
- **Open Graph / meta description / theme-color** tags
- **`gclid` capture** on landing and persistence through to form submission
- **`?preset=personal-loan`** that pre-seats the chatbot for personal-loan visitors (skips asset-type & entity, sets $5,000 minimum)
- **ABR ABN + name lookup** with the production GUID `e9d00f80-e531-4bec-8ef7-492c760ed15d`. If you want your own GUID, register at https://abr.business.gov.au/Tools/WebServices and replace the `ABR_GUID` constant near the top of the script in `enquiry-form.html`.
- **Sticky mobile CTA**, click-to-call links, responsive layouts, prefers-reduced-motion, ringing phone-icon animation
- **51 lender logos** in `/lenders/` and three credibility badges + three hero images in `/branding/`
- **Form popup modal** on all three landing pages (iframe overlay with ESC/backdrop close)
- **Chatbot hero embed** on all three landing pages (iframe already positioned, no extra wiring needed)
- **"Today's Best Rate" glass tile** on car and commercial heroes (currently shows 6.49% p.a. for car and 7.49% p.a. for commercial — hard-coded in the HTML; update these numbers directly in the file when rates change)

---

## 8. Pre-launch checklist

Search/replace across all five HTML files:

- [ ] `AW-XXXXXXXXXX` → real Google Ads ID
- [ ] `/AAAAAAAA` (in enquiry-form.html, thank-you.html) → real conversion label(s)
- [ ] `REPLACE_FORM_ID` (in enquiry-form.html) → real Google Form ID
- [ ] All `entry.10010010X` IDs (in enquiry-form.html) → real entry IDs from the form
- [ ] Inter-page links updated if slugs are not `.html`

Then verify with **Chrome → Lighthouse → Mobile** for each page:
- Performance ≥ 95
- Accessibility ≥ 95
- SEO 100
- Best Practices ≥ 95

And install the **Google Tag Assistant** Chrome extension to confirm the `conversion` event fires on `thank-you.html` after a test submission from each of the three landing pages.

---

## 9. Any questions

Direct any "how does X work" questions back to Michael — he has the context and can ping the AI assistant that built this. Full reference is in `README.md` in the repo.
