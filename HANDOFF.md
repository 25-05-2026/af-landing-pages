# IT Handoff — Acquired Financial Services landing pages

A short, action-focused checklist for your developer. The full deploy guide is in [README.md](README.md) — this is the "do these things in this order" version.

---

## 1. Get the code

Either:
- **Clone the repo:** `git clone git@github.com:25-05-2026/af-landing-pages.git`
- **Download a ZIP:** go to https://github.com/25-05-2026/af-landing-pages → green "Code" button → "Download ZIP"

Live preview (currently hosted on GitHub Pages so you can see what it should look like): https://25-05-2026.github.io/af-landing-pages/

---

## 2. The files

| File | What it is |
|------|------------|
| `car-finance.html` | Retail car / lifestyle asset landing page |
| `abn-business-finance.html` | Business / ABN asset finance landing page |
| `apply.html` | Multi-step eligibility form with live ABR ABN+name lookup. All CTAs link here. |
| `thank-you.html` | Post-submit confirmation page. Google Ads conversion fires here. |
| `branding/` | Logos, badges, white silhouette variants |
| `lenders/` | 51 lender PNG logos used by the scrolling strip |
| `mobile-preview.html` | A tool — not for production. Loads each page in a phone-frame iframe for design review. |
| `README.md` | Full deploy guide with all the detail |

---

## 3. Install on WordPress (pick ONE approach)

### Recommended: Elementor Canvas page templates

1. In WordPress: **Pages → Add New** for each of the four pages:
   - "Car Finance Quote"
   - "Business Finance Quote"
   - "Apply"
   - "Thank You"
2. For each page set **Page Attributes → Template = Elementor Canvas**  
   *This removes the theme header/footer — important for Google Ads quality score.*
3. Set permalinks: `/car-finance-quote`, `/business-finance-quote`, `/apply`, `/thank-you`
4. In Elementor for each page, drag in an **HTML widget** and paste the entire `<body>...</body>` contents of the corresponding `.html` file
5. Put the `<style>` and `<script>` blocks from each file's `<head>` into **Elementor → Site Settings → Custom CSS** (for the styles) plus a separate **HTML widget at the top of the page** (for the JS + Schema.org JSON-LD)

### Alternative: custom theme page templates

Create `wp-content/themes/your-theme/page-{slug}.php` for each:

```php
<?php /* Template Name: Car Finance Landing */ ?>
<!-- paste the full contents of car-finance.html here -->
```

Then create Pages and pick the template under **Page Attributes**.

### Either way — upload the static assets

The HTML files reference these folders with relative paths:

- `/branding/` (~6 files, ~1MB)
- `/lenders/` (51 files, ~600KB)

Upload them to **the same folder** as the HTML pages in WordPress so relative paths still resolve. Either via FTP/SFTP into `wp-content/uploads/landing-pages/` and update the paths in HTML, OR — easier — upload through Elementor's media library and let WP track them.

---

## 4. Update inter-page links

Once the WordPress slugs are decided, search & replace across all four HTML files **before pasting into WordPress**:

| Find | Replace with |
|------|--------------|
| `apply.html?from=car-finance` | `/apply?from=car-finance` |
| `apply.html?from=abn-business` | `/apply?from=abn-business` |
| `thank-you.html` | `/thank-you` |
| `car-finance.html` | `/car-finance-quote` |
| `abn-business-finance.html` | `/business-finance-quote` |

Skip this if you keep the `.html` suffixes.

---

## 5. Wire the form to Google Forms (CRITICAL — the form doesn't submit anywhere yet)

In `apply.html`, search for `GOOGLE_FORM_URL` (around line 1593). Two things to do:

### a) Build a Google Form

Create a Google Form with one question per field. The full list of ~32 fields is in **README §4**. The order doesn't matter — only the entry IDs do.

### b) Plug in the form URL + entry IDs

Replace:
```javascript
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/REPLACE_FORM_ID/formResponse';
const FORM_FIELD_MAP = {
  firstName: 'entry.100100100',
  // ...all the entry.XXX IDs
};
```

With your actual Google Form's `/formResponse` URL and the entry IDs from the form's HTML source (or its "Get pre-filled link" output). README §4 step 2 explains how to find them.

### c) Hook the Google Form to a Sheet (and optionally a CRM)

In the form: **Responses → Link to Sheets**. Every submission lands as a row. Add a Zapier/Make trigger on new responses to push into Ambition / Slack / email if needed.

---

## 6. Wire Google Ads conversion tracking (CRITICAL — campaigns can't optimise without this)

Same conversion ID block sits at the top of `<head>` in all four files, currently commented out:

```html
<!-- <script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXXX');
</script> -->
```

Uncomment it, replace `AW-XXXXXXXXXX` with the real Google Ads ID. Then in `apply.html` and `thank-you.html`, search for `AW-XXXXXXXXXX/AAAAAAAA` and replace with the real `AW-id/conversion-label` per README §5.

If using GTM instead of direct gtag: skip the inline block, add the GTM container snippet to all four files' `<head>`, and trigger the conversion from a custom event on `thank-you.html`.

---

## 7. Things that are ALREADY wired

So you don't need to touch them:

- **Schema.org JSON-LD** for FinancialService + FAQPage (in the `<head>` of each landing page)
- **Open Graph / meta description / theme-color** tags
- **`gclid` capture** on landing and persistence to apply submission
- **`?from=`** source attribution so leads tag back to the right campaign
- **ABR ABN + name lookup** with the production GUID `e9d00f80-e531-4bec-8ef7-492c760ed15d`. If you want your own GUID, register at https://abr.business.gov.au/Tools/WebServices and replace the `ABR_GUID` constant near the top of the script in `apply.html`.
- **Sticky mobile CTA**, click-to-call links, responsive layouts, prefers-reduced-motion, ringing phone-icon animation
- **51 lender logos** in `/lenders/` and three credibility badges in `/branding/`

---

## 8. Pre-launch checklist

Search/replace across all 4 HTML files:

- [ ] `AW-XXXXXXXXXX` → real Google Ads ID
- [ ] `/AAAAAAAA` (in apply.html, thank-you.html) → real conversion label(s)
- [ ] `REPLACE_FORM_ID` (in apply.html) → real Google Form ID
- [ ] All `entry.10010010X` IDs (in apply.html) → real entry IDs from the form
- [ ] Inter-page links updated if slugs are not `.html`

Then verify with **Chrome → Lighthouse → Mobile** for each page:
- Performance ≥ 95
- Accessibility ≥ 95
- SEO 100
- Best Practices ≥ 95

And install the **Google Tag Assistant** Chrome extension to confirm the `conversion` event fires on `thank-you.html` after a test submission.

---

## 9. Any questions

Direct any "how does X work" questions back to Michael — he has the context and can ping the AI assistant that built this. Full reference is in `README.md` in the repo.
