# Quickstart: Auto Download component

## Local check

1. Run the marketing app. Open `http://hourofai.marketing-sites.localhost:3001/toolkit` (live behaviour) and `http://preview-hourofai.marketing-sites.localhost:3001/toolkit` (auto-download off).
2. On the live host, the PDF saves under its file name and the page stays put. Back then forward: there is no second download.
3. With JavaScript disabled, the message and link render, and the link opens the file.
4. Storybook: `yarn workspace @code-dot-org/marketing-storybook storybook` → **Auto Download** stories.

## Publishing a download page (editors)

1. Upload the file as an asset in the Hour of AI space (keep PDFs tagged and accessible) and publish it.
2. Create an Experience with the slug you want (for example `toolkit`). Add **Auto Download** and pick the asset for **File**.
   - **First use only**: confirm the picker offers PDFs. If it doesn't, stop and tell engineering (research R1 fallback).
3. In the page's SEO settings, set **noindex**.
4. Publish. The short URL serves the page after the normal cache window. Pages are fresh for 15 minutes per cache layer, so allow up to about 30 minutes.

## Replacing the file

**Recommended**: upload the new file as a **new asset** and publish it. In Studio, pick it for **File** on the download page, then publish the page. No deploy is needed.

- Publishing the page sends the existing revalidation webhook, so the page refreshes straight away.
- The old asset stays published, so anyone served the cached page in the meantime still gets a working file.
- Unpublish or archive the old asset a day later.

**Replace file on the same asset**: this also works, but the file's URL changes and the page itself hasn't changed. The page keeps pointing at the old URL until its cache expires (up to about 30 minutes). If Contentful stops serving the old URL within that window, the download fails for those visitors.

## Analytics (analytics manager)

See [contracts/file-download-event.md](contracts/file-download-event.md). One-time setup:

- Keep "File downloads" switched on in the property's built-in tracking.
- Register `method` as a custom dimension.
- Hour of AI shares the Code.org property. Filter reports by hostname `hourofai.org`.

## Verifying the event

With GA debug mode (or Tag Assistant) and analytics consent granted:

- Load the page and expect one `file_download` with `method=auto`.
- Click the link and expect one `file_download` without `method`.
