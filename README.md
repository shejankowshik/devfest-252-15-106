# Tender Package Checker

A small browser-based tool for organizing and validating PDF documents for a tender submission. It loads a tender’s requirements from JSON, lets the user match PDFs to requirements, checks expiry dates, and creates one combined package PDF.

## Features

- Load tender details and document requirements from `requirements.json`.
- English and Bangla interface; document labels use `title_en` or `title_bn`.
- Add PDF files, count their pages, and remove files.
- Enforce a maximum of 30 uploaded PDFs and 50 MB total.
- Detect identical PDF contents using SHA-256, even when filenames differ. Duplicate copies are marked and cannot be matched as separate documents.
- Match each PDF to at most one requirement and each requirement to at most one PDF.
- Validate required documents and expiry dates. An expiry date equal to the submission deadline is valid.
- Generate a combined PDF with an English cover page, matched documents in requirement order, and a page-number footer.
- Process files in the browser. Files are not sent to a server.

## Project files

Keep these files together in the folder served by your web host:

```text
index.html
style.css
script.js
requirements.json   # Select this file from the app; it is not loaded automatically
```

The app loads PDF.js and pdf-lib from public CDNs, so an internet connection is needed when the page loads.

## Run locally

Browser security features used for hashing require a secure context. Run the folder on `localhost` instead of opening `index.html` directly as a `file://` URL.

For example, with Python installed, open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000) and select your `requirements.json` file.

## Publish with GitHub Pages

1. Put `index.html`, `style.css`, and `script.js` in the repository’s published folder (usually the repository root).
2. Push the files to GitHub.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose the branch and folder containing the three files, and save.
5. Open the Pages URL shown in the repository settings.

For a project site, GitHub Pages URLs normally include the repository name, such as `https://<username>.github.io/<repository>/`. Confirm the exact URL in the repository’s Pages settings.

## `requirements.json` format

Choose a JSON file with a `tender` object and a `requirements` array. Each requirement needs a unique `id`. Use `order` to control the document sequence.

```json
{
  "tender": {
    "tender_id": "TENDER-2026-001",
    "title": "Supply of Office Equipment",
    "procuring_entity": "Example Procuring Entity",
    "bidder": "Example Bidder Ltd.",
    "submission_deadline": "2026-12-31"
  },
  "requirements": [
    {
      "id": "trade-license",
      "order": 1,
      "title_en": "Trade License",
      "title_bn": "ট্রেড লাইসেন্স",
      "mandatory": true,
      "has_expiry": true
    },
    {
      "id": "bank-solvency",
      "order": 2,
      "title_en": "Bank Solvency Letter",
      "title_bn": "ব্যাংক সচ্ছলতার সনদ",
      "mandatory": true,
      "has_expiry": false
    },
    {
      "id": "vat-certificate",
      "order": 3,
      "title_en": "VAT Certificate",
      "title_bn": "ভ্যাট সনদ",
      "mandatory": false,
      "has_expiry": true
    }
  ]
}
```

Dates should use `YYYY-MM-DD`. If `has_expiry` is `true`, the user enters the matched document’s expiry date in the app.

## Validation behavior

- **Missing**: a mandatory requirement has no matched PDF; generation is blocked.
- **Expiry date needed**: a matched document requires an expiry date and none has been entered; generation is blocked.
- **Expired**: the expiry date is before today or before the submission deadline; generation is blocked.
- **OK**: a matched document passes the applicable checks. An expiry date equal to the submission deadline is accepted.
- **Not provided**: an optional document has no matched PDF; this does not block generation.

## Storage and privacy

The app does not use `localStorage`. Tender data, file contents, matches, and expiry dates remain in page memory and are cleared when the page is reloaded or closed. PDF processing happens in the browser; the app has no backend upload endpoint.

## Current limitations

- The generated cover uses pdf-lib’s standard Helvetica font. Standard PDF fonts do not support every Unicode character, so Bangla or other unsupported characters in tender values, IDs, or filenames may cause PDF generation to fail. Use English/WinAnsi-compatible values for the generated PDF, or embed a Unicode font before relying on Bangla values in packages.
- The footer is drawn near the bottom margin of each page. Source PDFs with content in that area may need their margins reviewed.
- PDF.js and pdf-lib are loaded from CDNs. The page needs internet access to load these libraries.
- The app does not inspect PDF text to determine whether the uploaded document actually satisfies its matched requirement. Matching and entered expiry dates must be reviewed by the user.

## Technologies

- HTML, CSS, and vanilla JavaScript
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF page counts and PDF validation
- [pdf-lib](https://pdf-lib.js.org/) for PDF merging and package generation
