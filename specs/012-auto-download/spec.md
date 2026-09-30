# Feature Specification: Auto Download component

**Feature Branch**: `012-auto-download`  
**Created**: 2026-09-30  
**Status**: Draft  
**Input**: User description: "We need to have a file available for download at a simple URL such as hourofai.org/toolkit. There are chances it will need to be updated a few times... Would this work as a component, that starts the auto-download on a page? This way we could re-use the functionality. It could be a simple content type that takes a media file. I believe our Analytics manager can create all the events needed, so no codebase work is needed next time we use this." The file is a PDF of roughly 150–250 KB.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visitor gets the file from a short URL (Priority: P1)

A teacher follows a short link (for example `hourofai.org/toolkit`) from an email, a slide, or a QR code. The page opens, the toolkit PDF starts downloading straight away, and the page tells them the download has started. If the download doesn't start, a clearly labelled link on the same page lets them get the file with one click.

**Why this priority**: This is the whole request. It is independently shippable: one page with the component on it delivers the short-URL download.

**Independent Test**: Publish an Experience page with the component bound to a PDF asset. Open the page in a fresh browser session and confirm the file is saved (not opened in the browser's PDF viewer) and the message and fallback link are visible.

**Acceptance Scenarios**:

1. **Given** a published page containing the component bound to a PDF, **When** a visitor opens the page, **Then** the file starts downloading within 2 seconds, is saved under its asset file name, and the visitor stays on the page.
2. **Given** the same page, **When** the visitor's browser has JavaScript disabled or blocks automatic downloads, **Then** the message and a working download link are still visible and the link delivers the file.
3. **Given** the visitor has downloaded the file, **When** they use the browser's back and forward buttons to return to the page, **Then** the file does not download a second time.

---

### User Story 2 - Editor replaces the file without engineering help (Priority: P1)

A content editor gets a revised toolkit. They upload it as a new asset, pick it on the download page in Studio, and publish. **Replace file** on the existing asset also works, with a cache-window caveat (see quickstart). Visitors to the same short URL get the new file. No code change or deploy is involved.

**Why this priority**: The file is expected to change several times. Hands-off updates are the reason for doing this in Contentful rather than the codebase.

**Independent Test**: Upload a new asset, pick it on the page in Studio, and publish the page. Open the page and confirm the new file is downloaded.

**Acceptance Scenarios**:

1. **Given** a published page using the component, **When** an editor picks a new asset and publishes the page, **Then** visitors receive the new file once the page revalidates, with no deploy. Visitors still served the cached page keep getting the old, still-published file.
2. **Given** an editor building a new page, **When** they add the component in Studio, **Then** they can pick any file asset (including PDFs) from the space's media library.
3. **Given** an editor working in Studio or on the preview site, **When** the component is on the canvas, **Then** no automatic download happens, and the component shows a note that auto-download is off in the editor and in preview.

---

### User Story 3 - Analytics manager measures downloads without code (Priority: P2)

The analytics manager wants a download count per file. Every automatic download started by the component sends one standard file-download analytics event, carrying the file's name, extension and URL. Fallback-link clicks are counted by the analytics tool's own built-in file-download tracking, which sends the same event with the same fields. The analytics manager builds per-file events and reports from that in the analytics tool, so reusing the component for a new file needs no code change.

**Why this priority**: Measurement is required, but the download works without it. Hour of AI reports into the shared Code.org analytics property.

**Independent Test**: With analytics enabled and consent granted, open a page using the component and confirm exactly one file-download event arrives with the expected file name. Click the fallback link and confirm exactly one more arrives, from the built-in tracking and without a `method` value.

**Acceptance Scenarios**:

1. **Given** a visitor who has accepted analytics cookies, **When** the automatic download starts, **Then** exactly one file-download event is recorded, with the file name, extension, URL, and a method of `auto`.
2. **Given** the same visitor, **When** they click the fallback link, **Then** exactly one file-download event is recorded, sent by the analytics tool's built-in download tracking. The component does not send a second one.
3. **Given** a visitor who has declined analytics cookies, **When** the download starts, **Then** the file still downloads and no analytics event is sent.

---

### Edge Cases

- **Download fails** (network error, file missing from the CDN): the page shows no error dialog. The message changes to say the automatic download didn't start and points to the fallback link, which stays usable.
- **No file bound** (editor forgot to pick one): on the live site the component renders nothing and does nothing. In Studio it shows a placeholder asking for a file.
- **More than one instance on a page**: only the first instance downloads automatically. Any others show their message and link only, so one visit never starts several downloads.
- **Mobile Safari and other browsers that preview files**: some mobile browsers show a preview or a "download?" prompt instead of saving silently. That is acceptable, and the fallback link covers anything else.
- **Reload**: reloading the page is a new visit and downloads again. That is expected. Only back/forward restores are suppressed.
- **Large files**: the target is small files (up to about 10 MB). Very large files are out of scope. The component still works for them, but it's not tuned for them.
- **Tenants and locales**: the component is registered for Hour of AI and Code.org, and other brands can add it with a registration. The message and link text can be authored per locale. The default copy is English.
- **Analytics unavailable** (no measurement id, script blocked, or consent declined): the download still works, and the event is simply dropped. Analytics never delays or blocks the download.
- **Availability**: the page is a normal Experience page and keeps its existing caching. The file is fetched directly from Contentful's CDN, not through the app server, so downloads add no load to the app.
- **Preview/draft**: automatic download is off in Studio's editor and on the preview host, so editors don't download the file on every edit.
- **Personal data**: none is collected. The analytics event carries file metadata only, sent to the analytics provider the site already uses, behind the existing consent banner. No Student Records are involved.
- **Server vs client**: the message, the link and the file details are rendered on the server. Only the automatic download and the analytics call run in the browser. That's the smallest possible client-only part, and it's needed because a download can only be started by the browser.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The component MUST let an editor bind exactly one Contentful file asset of any file type, including PDF.
- **FR-002**: When a live page loads, the component MUST start downloading the bound file automatically, saving it under the asset's file name rather than opening it in the browser's viewer.
- **FR-003**: The component MUST render, server-side, a visible status message and a real link to the file that works without JavaScript. The link opens the file in a new tab, and its accessible name says so. The automatic step always saves the file, because browsers block tabs opened without a click (confirmed with Dee 2026-09-30).
- **FR-004**: The message and link text MUST be editable per instance and localizable. The defaults are "Your download should start automatically." and "If it doesn't, download the file here."
- **FR-005**: The component MUST NOT start a download in Studio's editor, in preview, or in draft mode. There it MUST show a short note that auto-download is off in that context.
- **FR-006**: Returning to the page via browser back/forward MUST NOT start a second download.
- **FR-007**: If more than one instance is on a page, only the first MUST download automatically.
- **FR-008**: If the automatic download fails, the component MUST update its message to point to the fallback link and MUST NOT show an error dialog or break the page.
- **FR-009**: Status changes (started, failed) MUST be announced to assistive technology without moving focus. The component MUST meet WCAG 2.x AA, including contrast on light and dark section backgrounds.
- **FR-010**: Each automatic download MUST send exactly one standard file-download analytics event. The event uses the same event name and field meanings as GA4's built-in download tracking (file name, file extension, file URL) plus a `method` value of `auto`. It MUST contain no personal data.
- **FR-011**: The analytics event MUST go through the site's existing analytics integration and consent gating. If analytics is unavailable, the event MUST be dropped without affecting the download.
- **FR-012**: A single user action MUST NOT be double-counted. The component MUST NOT send its own event for fallback-link clicks, because GA4's built-in download tracking already counts them. The automatic download MUST NOT trigger the built-in tracking.
- **FR-013 (affected layers)**: The component belongs in the marketing app's Contentful component layer (`apps/marketing`). It is registered for Hour of AI and Code.org in Studio's `08: Advanced` category, and other brands can add it with a registration. It MUST be built with MUI and follow the section-background (light/dark) text colour convention. No shared design-system package change is expected.
- **FR-014 (validation surfaces)**: Required: Storybook stories in the marketing Storybook, covering bound, unbound, editor/preview-disabled, failed, and dark-background states, with `play` coverage for the status message and link. Unit tests for the download trigger, the editor/preview suppression, back/forward suppression, single-instance behaviour, and analytics payload. Registration test for the Hour of AI brand.
- **FR-015 (runtime flows)**: No middleware, route handler, redirect, or revalidation change. The component uses the Experiences SDK's existing registration path and editor-mode signal. Pages using it are served by the existing Experience route with unchanged caching (SWR/SIE).
- **FR-016 (client boundary)**: Everything visible MUST be in the server-rendered HTML. Only the download trigger and the analytics call may run after hydration. Contentful components already render inside the Experiences SDK's client root, so this adds no new `use client` boundary. The client part MUST add no third-party dependency.
- **FR-017 (privacy)**: No new data collection and no new third-party recipient. The only data sent is file metadata, to the existing analytics provider, behind existing consent.
- **FR-018 (Contentful)**: No content type or schema change. The file is a component variable bound to an asset. Whether Studio's asset picker accepts PDFs for that variable MUST be confirmed with the Contentful MCP or in Studio during planning. If it doesn't, fall back to a small content type holding one file field, which goes through the data-model review and human-approved schema change.
- **FR-019 (Contentful writes)**: The editor uploads the toolkit PDF. Any draft page Claude creates (for example the `toolkit` Experience) is proposed to a human first, left unpublished for review, and re-read after writing to confirm its state.
- **FR-020 (SEO)**: The component changes no page metadata itself. Authoring guidance MUST say pages that auto-download should be marked `noindex`, which also keeps them out of the runtime sitemap under the existing Experience-page rule. Canonical and structured-data behaviour are unchanged.

## Integration Points _(mandatory when external systems or cross-workspace changes are involved)_

### Systems and Contracts

- **Upstream Inputs**: A Contentful file asset bound in Studio (URL, file name, content type). The Experiences SDK's editor-mode signal. The site's draft/preview state. The existing OneTrust consent state.
- **Downstream Effects**: One standard GA4 `file_download` event per download (`file_name`, `file_extension`, `link_url`, plus a custom `method: 'auto'` parameter the analytics manager registers as a custom dimension). Fallback-link clicks are counted by GA4's built-in file-download tracking, which the analytics manager keeps switched on in the Hour of AI property. No cache tags, redirects, or SEO metadata changes.
- **Runtime Surfaces**: A new marketing Contentful component and its Studio definition. Hour of AI and Code.org brand registrations. Marketing Storybook stories and mocks. Unit tests.
- **Tenant / Hostname Paths**: `http://hourofai.marketing-sites.localhost:3001/toolkit` (live behaviour) and `http://preview-hourofai.marketing-sites.localhost:3001/toolkit` (auto-download suppressed).

### Data Flow Notes

- Page request → existing Experience route (cached, SWR/SIE) → server-rendered message and link → in the browser, the file is fetched from Contentful's CDN and saved locally → analytics event queued through the existing integration.
- Contentful's image/asset CDN was checked on 2026-09-30 and returns `Access-Control-Allow-Origin: *`. That allows the browser to fetch the file itself and save it under a chosen name, even though the file is on a different domain from the page. This needs re-checking on the asset host PDFs are actually served from.
- If the fetch fails, nothing is retried automatically. The fallback link is the recovery path. Consent is never bypassed: a declined or unset consent means no event.
- Contentful MCP was not authenticated when this was written, so no schema or entry details are MCP-confirmed yet. The asset-binding assumption comes from the existing Video component's `Media` variable, which accepts asset bindings.
- Contentful writes are limited to a human-approved draft `toolkit` page, re-read after writing. The editor uploads the PDF.
- SEO: `noindex` on download pages by authoring convention. Sitemap exclusion follows from that with no code change.

### Key Entities

- **Download file**: a Contentful asset (the toolkit PDF). What matters is its public URL, its file name (used as the saved name and in analytics), and its type.
- **Auto Download instance**: one placement of the component on an Experience page. It has a bound file, an optional message, and optional link text.
- **Download event**: an analytics record of one download, holding the file name, extension, URL, and method (`auto` or `link`).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A visitor opening the short URL has the file saved within 2 seconds on a typical broadband connection, with no extra click, in current Chrome, Edge, Firefox, and desktop Safari.
- **SC-002**: 100% of visitors, including those with JavaScript off or auto-downloads blocked, can get the file from the page in one click.
- **SC-003**: An editor can replace the file and have visitors receive it with zero code changes or deploys, once the page's normal cache window has passed.
- **SC-004**: Each download started with consent produces exactly one analytics event, across 10 consecutive test downloads.
- **SC-005**: A second file can be published at a new short URL with no engineering work: an editor adds the component to a new page, and the analytics manager configures reporting.
- **SC-006**: The page passes an automated accessibility audit with zero WCAG AA violations on both light and dark section backgrounds.

## Assumptions

- The page is a standard Contentful Experience with a slug (for example `toolkit`). Locale handling for bare URLs such as `/toolkit` follows the site's existing behaviour.
- Hour of AI shares the Code.org GA4 property and measurement id (decided 2026-09-30), and reports are split by hostname.
- The site loads GA4 directly (not through Tag Manager). So the analytics manager can derive events and dimensions from what the site sends, but can't add new page triggers without code. That's why the component sends a generic event.
- GA4's built-in file-download tracking is switched on in the Hour of AI property. It counts fallback-link clicks, and the component only reports automatic downloads (see FR-012).
- Files are small (the toolkit is 150–250 KB). Editors keep uploaded PDFs tagged and accessible when compressing them.
- Existing cache headers and revalidation windows stay unchanged. There's no new route handler or middleware.
- No new personal-data collection, Student Records, or third-party data sharing is introduced.
