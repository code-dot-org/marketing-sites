# Research: Auto Download component

Checked 2026-09-30. Each item says whether it was **confirmed** (MCP, live HTTP check, or installed source) or **inferred** (from app code only).

## R1. What the component receives from a Media binding

- **Decision**: The file is a `Media` variable (`file`) with `bindingSourceType: ['asset']`. The component receives the asset's file URL as a string. The saved file name is the URL's last path segment, decoded.
- **Rationale**: Confirmed in the installed SDK (`@contentful/experiences-core` 3.8.10, `transformMedia`): any `Media` variable not named `cfImageAsset` or `cfBackgroundImageUrl` resolves to `asset.fields.file.url`, whatever the file type. Contentful file URLs end in the asset's `fileName`, so the name can be recovered without a second variable.
- **Still to confirm**: whether Studio's asset picker offers non-image assets for a `Media` variable. That is a Studio UI behaviour, and neither MCP nor the SDK source shows it. Dee checks it in Studio on the first draft page (see quickstart).
- **Fallback if Studio refuses PDFs**: bind the URL through an entry instead. Either reuse an existing type with a file field, or propose a one-field `download` content type (title + file) for Dee to approve. The component stays the same because it still receives a URL string.
- **Alternatives considered**: a whole-entry `Link` binding (rejected: that pattern failed Studio testing on Unit Card); a `Text` URL field (rejected: the URL's upload hash changes on every file replace, which breaks FR-002 and US2).

## R2. Where PDFs are served from, and CORS

- **Confirmed (MCP, Hour of AI space `hwu8vzk5v0g2:master`)**: asset URLs use Code.org custom domains and are protocol-relative. Images use `//contentful-images.code.org/…` and videos use `//contentful-videos.code.org/…`.
- **Inferred**: non-image files such as PDFs use `//contentful-assets.code.org/…`. No PDF exists in the space yet. Re-check the URL once the toolkit is uploaded.
- **Confirmed (live HTTP, 2026-09-30)**: `contentful-assets.code.org`, `contentful-downloads.code.org`, `contentful-videos.code.org`, `assets.ctfassets.net`, and `images.ctfassets.net` all return `Access-Control-Allow-Origin: *` (GET/HEAD). A plain `fetch` needs no preflight.
- **Confirmed (repo)**: the app sets no Content-Security-Policy, so nothing blocks `connect-src`.
- **Decision**: prefix `https:` to protocol-relative URLs, the same way as `getImage.ts`.

## R3. Forcing a save instead of opening the PDF viewer

- **Decision**: `fetch(url, {credentials: 'omit'})` → `Blob` → `URL.createObjectURL` → a temporary `<a download="{fileName}">` → `click()` → remove the element, and revoke the object URL after 30 s.
- **Rationale**: browsers ignore `download` on cross-origin hrefs, so a direct link opens the PDF viewer and takes the visitor off the page. A `blob:` URL is same-origin, so `download` is honoured in Chrome, Edge, Firefox, and Safari. At 150–250 KB, holding the file in memory costs nothing. Revoking immediately breaks Firefox, hence the delay.
- **Alternatives considered**:
  - `window.location` or a hidden iframe: opens the viewer, and navigation can cancel the analytics event.
  - Proxying through an app route with `Content-Disposition: attachment`: adds origin load and a new route, against the availability-first rule.
  - Contentful download query parameters: not supported by the asset CDN.

## R4. Editor, preview, and draft suppression

- **Decision**: register with `enableEditorProperties: {isEditorMode: true}`, as CourseCatalog does, and suppress auto-start when `isEditorMode` is true. Also suppress when `PREVIEW_HOSTNAMES.has(window.location.host)`.
- **Rationale**: confirmed in repo. `withBrand` forces draft mode on every preview hostname, so the preview-host check also covers draft. The live host never runs draft mode.

## R5. Back/forward, reloads, several instances, Strict Mode

- **Back/forward**: skip when the initial navigation entry is `back_forward` **and** its `name` equals the current `location.href`, so that a later client-side navigation to the page still downloads. Pages restored from the back/forward cache don't re-run effects, so no extra handling is needed there.
- **Several instances**: a module-level "claimed" flag. The first instance to mount claims it and releases it on unmount. Others render as link-only.
- **Strict Mode (dev double effects)**: effect cleanup aborts the in-flight fetch with an `AbortController` and releases the claim, so only the second pass downloads.

## R6. Analytics event and double counting

> **Superseded in part (2026-09-30):** Dee asked for authored analytics parameters on both automatic downloads and link clicks. GA's built-in tracking can't carry them, so the component now reports link clicks itself (`method: 'link'`) and stops the click from reaching GA's document-level listener. That was verified against the live gtag on the local page: one click sent exactly one `file_download` and no built-in `file_download` or outbound `click`. The contract in contracts/file-download-event.md is current; the original decision is kept below for history.

- **Confirmed (installed source)**: `sendGAEvent` from `@next/third-parties/google` pushes onto `window.dataLayer`. If GA hasn't initialised or the data layer doesn't exist yet, it drops the event with a console warning. `GoogleAnalytics` injects its init script with `next/script` (`afterInteractive`), so it can run after the component's hydration effect.
- **Confirmed (repo)**: GA loads directly (gtag.js, no Tag Manager) inside `OneTrustProvider`. OneTrust's auto-block script holds back `googletagmanager.com` until consent. Hour of AI now shares Code.org's measurement id (`G-L9HT5MZ3HD`, set 2026-09-30), and its OneTrust domain is configured.
- **Decision**: `sendFileDownloadEvent` sends `gtag('event', 'file_download', {file_name, file_extension, link_url, method: 'auto'})` once the download has started.
  - If `window.dataLayer` isn't there yet, it retries once after the window `load` event, then drops the event.
  - Parameter meanings match GA4's built-in file-download tracking: `file_name` is the URL path, `file_extension` has no dot, `link_url` is the absolute URL.
  - Fallback-link clicks are **not** reported by the component, because the built-in tracking already counts them (it fires on clicks of links ending in `.pdf` and other extensions).
  - The automatic download uses a `blob:` link with no extension, so the built-in tracking never counts it. Each action produces exactly one event.
- **Rationale**: this is the only design that can't double count and needs no GA configuration beyond the defaults. It also lets the analytics manager build per-file events from one standard event.
- **Alternatives considered**:
  - The component reports link clicks too: double counts whenever the built-in tracking is on, which is the GA default.
  - Pushing to `dataLayer` before init: an event queued before `config` may be dropped, so it is unreliable.
  - Server-side Measurement Protocol: bypasses consent, adds data egress, and misses CDN-served hits.
- **Needs the analytics manager**:
  - Keep "File downloads" switched on in the Hour of AI property's built-in tracking.
  - Register `method` as an event-scoped custom dimension.
  - Filter Hour of AI traffic by hostname (`hourofai.org`) in the shared Code.org property.

## R7. Rendering and client boundary

- **Confirmed (repo)**: `ExperiencePageLoader` is `'use client'` and wraps `ExperienceRoot`, so every Contentful component already renders inside a client root. The server-side render still emits their HTML.
- **Decision**: no new `'use client'` root boundary. The message and link are in the server-rendered HTML. The download and analytics run in one `useEffect`. There are no new dependencies.

## R8. Composition and theming

- **Decision**: build with MUI (`Box`, `Typography`). Reuse the marketing `Link` component for the fallback link, so it inherits brand link styling and the section-background contrast switch. Take the message text colour from `useSectionBackground()`, following the Paragraph and Custom Text convention. Put the status line in `role="status"` (a polite live region), so the change to the failure message is announced without moving focus.

## R9. SEO and caching

- **Decision**: no code change. The page is a standard Experience with unchanged SWR/SIE headers. The authoring guidance (component tooltip + quickstart) says to set the page's SEO `noindex`, which also removes it from the runtime sitemap under the existing Experience rule.
