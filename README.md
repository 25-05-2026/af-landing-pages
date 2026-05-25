# Acquired Financial Services — Google Ads landing pages

Four self-contained HTML files designed for Google Ads campaigns. Modelled on National Loans' conversion approach (lifestyle hero, loan-type tiles, multi-CTA, dedicated apply page). No build step, no dependencies (one Google Font, one logo URL from your existing WordPress site).

## File map

| File | Purpose | URL slug suggestion |
|------|---------|--------------------|
| `car-finance.html` | Retail car / lifestyle asset landing | `/car-finance-quote` |
| `abn-business-finance.html` | Business / ABN asset finance landing | `/business-finance-quote` |
| `apply.html` | **Multi-step lead qualification form** with live ABR ABN lookup — every CTA on the landing pages links here | `/apply` |
| `thank-you.html` | Post-submit confirmation, fires Google Ads conversion | `/thank-you` |

## Lead flow

```
Google Ad
   ↓
Landing page (car-finance.html or abn-business-finance.html)
   ↓ Any CTA: "Check Eligibility" / "Start The Chat" / "Get A Quote"
apply.html?from=car-finance     ← source param baked into every CTA
   ↓ 4-step qualification form (~2-3 min)
   │  · Step 1: Asset, amount, timeframe
   │  · Step 2: Personal vs Business + ABR ABN verification
   │  · Step 3: Residency, income, credit, living situation
   │  · Step 4: Name, contact, state, contact preference
   ↓
[POST to your Google Form]      ← stub — see §4
   ↓ + Google Ads conversion event fires
thank-you.html                  ← polished confirmation page
```

The form (`apply.html`) is the lead-capture hub. Both landing pages are pure marketing/qualification — they don't capture leads themselves; they push to the form.

---

## 1. Local preview

Double-click any `.html` file to open it in your browser. All images load from `acquiredfinance.com` so no local assets are needed.

Test the full flow:
1. Open `car-finance.html`
2. Click any "Check Eligibility" or "Start The Chat" button
3. Complete the form at `apply.html` (use any test data)
4. Confirm you land on `thank-you.html`

Live preview: **https://25-05-2026.github.io/af-landing-pages/**

---

## 2. Installing on WordPress

Three options, ranked easiest to most powerful.

### Option A — Elementor HTML widget (fastest)

For **each** of the four HTML files:

1. **Pages → Add New** → name it (e.g. *Car Finance Quote*).
2. **Page Attributes → Template = Elementor Canvas** (removes theme header/footer — critical for Google Ads quality score).
3. Edit with Elementor, drag an **HTML widget** onto the canvas.
4. Open the `.html` file in a text editor, copy everything **between `<body>` and `</body>`** (NOT the `<head>` block), paste into the HTML widget.
5. Paste the `<head>` `<style>` and `<script>` blocks into:
   - Elementor → Site Settings → Custom CSS (for styles), AND
   - A separate Custom HTML widget at the top of the page (for `<script>` tags + Schema.org JSON-LD)

Set permalinks: `/car-finance-quote`, `/business-finance-quote`, `/apply`, `/thank-you`.

### Option B — Custom page template (cleanest)

For each file, create `wp-content/themes/your-theme/page-{name}.php`:
```php
<?php /* Template Name: Car Finance Landing */ ?>
```
Then paste the full HTML after the line. Repeat for all four. Assign the templates in Page Attributes.

### Option C — Direct upload (avoid for ads)

Upload all four files to `wp-content/uploads/landing/` and use the direct URLs. Not recommended — looks unprofessional and hurts Google Ads quality score.

---

## 3. Update inter-page links after deployment

The HTML uses **relative links** between pages (`apply.html`, `thank-you.html`, `car-finance.html`, `abn-business-finance.html`). After deployment in WordPress, swap these for your actual slugs.

**Search & replace** across all four files before deploying:

| Find | Replace with |
|------|--------------|
| `apply.html?from=car-finance` | `/apply?from=car-finance` |
| `apply.html?from=abn-business` | `/apply?from=abn-business` |
| `thank-you.html` | `/thank-you` |
| `car-finance.html` | `/car-finance-quote` |
| `abn-business-finance.html` | `/business-finance-quote` |

If you keep the `.html` suffix, leave these alone.

---

## 4. Wire the form to your Google Form (CRITICAL)

The form currently logs lead data to the console and skips the network call. You need to:

### Step 1 — Build a matching Google Form

Create a Google Form with one question per field below. The exact question wording doesn't matter — only the **order** matters when you map entry IDs.

#### Asset & loan (Step 1 of the form)

| Field | Suggested question | Type |
|-------|--------------------|------|
| assetType | Asset / loan type | Short answer (auto-set from landing page) |
| amount | How much do you need? | Short answer (number) |
| timeframe | Settlement timeframe | Multiple choice (ASAP / Within a month / Just looking) |

#### Entity & ABN verification (Step 2)

| Field | Suggested question | Type |
|-------|--------------------|------|
| entity | Personal or Business? | Multiple choice |
| abn | ABN (11 digits) | Short answer |
| abnEntityName | Verified entity name (from ABR) | Short answer |
| abnEntityType | Entity type (Pty Ltd / sole trader / etc.) | Short answer |
| abnStatus | ABN status (Active / Cancelled) | Short answer |
| abnTradingFrom | ABN effective-from date | Short answer |
| abnGst | GST registration date | Short answer |
| abnTradingNames | Trading names from ABR | Short answer |
| abnState | Address state (ABR) | Short answer |
| abnPostcode | Address postcode (ABR) | Short answer |
| abnConfirmed | User confirmed the ABR match? | Multiple choice (Yes / No) |

#### Eligibility / financial situation (Step 3)

| Field | Suggested question | Type |
|-------|--------------------|------|
| residency | Residency status | Multiple choice (Australian Resident / PR / On a Visa) |
| visaSubclass | Visa subclass (if Visa) | Short answer |
| visaExpiry | Visa expiry date | Short answer (date) |
| income | Income source | Multiple choice (Employed / Employed + Centrelink / Centrelink only) |
| centrelinkPct | % income from Centrelink | Short answer |
| credit | Credit history | Multiple choice (Clear / Has defaults / Not sure) |
| living | Living situation | Multiple choice (Home owner / Mortgaged / Renting / Boarding) |
| investmentProperty | Own an investment property? (if renting/boarding) | Multiple choice (Yes / No) |

#### Contact (Step 4)

| Field | Suggested question | Type |
|-------|--------------------|------|
| firstName | First name | Short answer |
| surname | Surname | Short answer |
| mobile | Mobile | Short answer |
| email | Email | Short answer |
| state | State you're in | Multiple choice (VIC, NSW, QLD, etc.) |
| contactMethod | Preferred contact method | Multiple choice (Phone / Text / Email) |

#### Hidden / attribution (auto-captured)

| Field | Purpose |
|-------|---------|
| gclid | Google Ads click ID — for offline conversion import |
| landingPage | Which landing page sent them (`car-finance` or `abn-business`) |
| source | Referrer URL or `direct` |
| submittedAt | ISO timestamp of submission |

Tip: For the four "hidden" attribution fields, make them short-answer and unrequired. They're invisible on the form but get captured automatically.

### Step 2 — Extract entry IDs

In your Google Form's edit view, click **Send → Link → Copy link** (the `/viewform` URL). Then:

1. Open the form's `/viewform` URL in your browser.
2. **View source** (Ctrl+U).
3. Search for `entry.` — you'll find a unique `entry.XXXXXXXXX` ID for every question.
4. Match each entry ID to its field in the order you created questions.

**Alternative method** (often easier):
1. In the form's edit view, click the **three dots (⋮) → Get pre-filled link**.
2. Fill in each field with a unique recognisable string (e.g. "FIRSTNAME", "EMAIL").
3. Submit the pre-filled link generator.
4. Copy the URL it produces — it'll look like `…/viewform?entry.111111=FIRSTNAME&entry.222222=EMAIL…`. Each entry ID is right next to its placeholder.

### Step 3 — Paste into `apply.html`

Open `apply.html`, search for `GOOGLE_FORM_URL` and `FORM_FIELD_MAP`. Replace:

```javascript
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/REPLACE_FORM_ID/formResponse';
const FORM_FIELD_MAP = {
  assetType:        'entry.100100100',
  amount:           'entry.100100101',
  // ... ~32 fields total
};
```

With your real values:
```javascript
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc_YOUR_FORM_ID/formResponse';
const FORM_FIELD_MAP = {
  assetType:        'entry.987654321',
  amount:           'entry.876543210',
  // ...
};
```

(The URL ending is `/formResponse`, NOT `/viewform` — submission posts to a different endpoint than the public view.)

### Step 4 — Connect Google Form to your CRM / Sheets

Two clean options:
- **Google Sheets** (simplest): in the form, click **Responses → Link to Sheets**. Every submission becomes a row.
- **Zapier / Make.com**: trigger on new Form response → push to Ambition CRM, Slack, email notification, etc.

---

## 5. Wire Google Ads conversion tracking (CRITICAL)

Without this, Google Ads can't optimise and you're flying blind.

### Step 1 — Create the conversion action

1. **Google Ads → Tools → Conversions → New conversion action → Website**.
2. Conversion: **"Finance Lead"**, category *Submit lead form*, value *AUD $50–$100* per lead.
3. After creation, you'll get IDs like:
   ```
   gtag('event', 'conversion', {'send_to': 'AW-1234567890/AbCdEfGhIjKlMnO'});
   ```

### Step 2 — Uncomment & replace in all 4 files

In every file, the top of `<head>` contains a commented-out gtag block:
```html
<!-- <script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"></script>
<script>
  ...
</script> -->
```

Uncomment it (remove the surrounding `<!--` and `-->`) and replace `AW-XXXXXXXXXX` with your real Google Ads ID.

### Step 3 — Replace the conversion send_to

In `apply.html` and `thank-you.html`, find:
```javascript
gtag('event', 'conversion', {'send_to': 'AW-XXXXXXXXXX/AAAAAAAA', ...});
```
Replace `AW-XXXXXXXXXX/AAAAAAAA` with your real `AW-id/conversion-label`.

**Tip:** create separate conversion actions for car-finance vs abn-business so Smart Bidding can optimise each campaign independently. The `from=` URL param (captured automatically as `landingPage` in the form) tells you which one fired.

### Step 4 — Verify with Tag Assistant

Install the **Google Tag Assistant** Chrome extension. Run through the full flow with test data. You should see:
- Page-load tag on every page
- `conversion` event firing on `thank-you.html`

---

## 6. ABR ABN verification

The form does **live Australian Business Register lookups** in Step 2:

- User enters an 11-digit ABN
- Field auto-formats (`12 345 678 901`)
- On 11 valid digits, a JSONP request hits `abr.business.gov.au/json/AbnDetails.aspx`
- An entity card renders inline showing: legal name, business names, status, trading-from date, entity type, GST status, address state/postcode
- User clicks **"Yes, that's us"** to confirm — captured as `abnConfirmed = "Yes"`

The GUID is baked into the form (`e9d00f80-e531-4bec-8ef7-492c760ed15d`). To use your own, register at https://abr.business.gov.au/Tools/WebServices and replace the `ABR_GUID` constant near the bottom of `apply.html`.

**Why this matters:** every business lead arrives pre-verified. Your broker doesn't need to re-check the ABN — they already have the legal name, GST status, and trading history. Speeds up first-call qualification significantly.

---

## 7. Campaign structure (recommended)

### Two campaigns, one per page

- **Campaign 1 — Car Finance** → `/car-finance-quote`
  - Ad group "Car loan comparison" → ad headlines mention "Compare 63+ lenders"
  - Ad group "Pre-approval" → ad headlines mention "Pre-Approved Today"
  - Ad group "Refinance car loan" → consider a dedicated refinance page later
- **Campaign 2 — ABN / Business Finance** → `/business-finance-quote`
  - Ad group "ABN vehicle finance"
  - Ad group "Excavator / yellow goods finance"
  - Ad group "Truck finance"
  - Ad group "Low-doc business finance"

### Ad copy must match landing-page headlines (#1 quality-score lever)

- Ad says **"ABN Vehicle Finance"** → landing headline says **"Finance built for business"** + asset tiles include utes ✅
- Ad says **"Compare Car Loans"** → landing headline says **"Finance that fits you"** + "63+ lenders" prominent ✅

If you launch ads with a different angle ("Bad Credit Car Loans" etc.), build a dedicated landing page — don't reuse a mismatched one.

### Use these features

- **Call extensions** with `1300 235 255` — captures clicks without a website visit.
- **Sitelink extensions** cross-linking the two landing pages.
- **Lead-form extensions** as a parallel funnel.

---

## 8. Speed & quality-score notes

The pages are already optimised:

- ✅ Single self-contained HTML per page (no waterfall of CSS/JS requests)
- ✅ One external font (Inter, preconnect-hinted)
- ✅ Logo lazy-loads from your CDN
- ✅ Mobile-first responsive
- ✅ `tel:` click-to-call everywhere + sticky mobile CTA bar
- ✅ Schema.org markup (FinancialService + FAQPage) → richer Google snippets + AI overviews
- ✅ `viewport-fit=cover` for iPhone notch
- ✅ Captures `gclid` URL parameter into `localStorage`, persisted through to the form submission
- ✅ ACL 488607 and indicative-rate disclaimers on relevant sections
- ✅ Live ABR ABN verification — leads arrive pre-qualified

**Lighthouse target:** Performance 95+, Accessibility 95+, SEO 100, Best Practices 95+ on mobile. Test in Chrome DevTools → Lighthouse → Mobile before launching ads.

---

## 9. Source attribution (very powerful for ROAS)

Every CTA on the landing pages passes `?from=car-finance` or `?from=abn-business` to `apply.html`. The form:
1. Captures this as `landingPage` in the lead data
2. Captures the `gclid` from URL or localStorage (set on first landing-page visit)
3. Auto-prefills `assetType` based on the `from=` param so the user doesn't have to re-pick
4. POSTs everything to your Google Form

In your CRM / Sheet, you can then:
- Filter leads by which landing page converted them
- A/B test landing-page variants (build `car-finance-v2.html` with one change, split traffic, compare conversion rate by `landingPage`)
- Use **Google Ads Offline Conversion Import** — when a lead settles, send the `gclid` + settled value back to Google Ads. Smart Bidding then optimises for *settlements* (real $$), not just lead submissions. Massively higher ROAS.

---

## 10. Things to update before going live

Search & replace across all files:

| Find | Replace with |
|------|--------------|
| `AW-XXXXXXXXXX` | Your Google Ads ID |
| `/AAAAAAAA` (in apply.html, thank-you.html) | Your conversion label |
| `https://docs.google.com/forms/d/e/REPLACE_FORM_ID/formResponse` | Your real Google Form `/formResponse` URL |
| All `entry.10010010X` IDs in `FORM_FIELD_MAP` | Real entry IDs from your form |

Optional but recommended: replace the bundled ABR GUID with your own (free at https://abr.business.gov.au/Tools/WebServices).

---

## 11. Optional next steps

- **Refinance landing page** — dedicated `refinance.html` for "refinance car loan" keywords would lift quality score noticeably.
- **A/B test headlines** — duplicate `car-finance.html` as `car-finance-v2.html`, change one headline, split traffic 50/50 in Google Ads.
- **Live Google Reviews feed** — drop an embed from Trustindex or Elfsight onto the awards row.
- **Finance calculator widget** — small JS slider showing indicative weekly repayments. I can build this.
- **Privacy policy & T&Cs** — links currently go to `acquiredfinance.com/privacy-policy` (verify the URL exists).
- **Bad-credit specialist page** — high-CPC keyword, lower competition, dedicated angle.

---

## Questions?

Ping me and I'll iterate — copy changes, new sections, new pages, or wiring help.
