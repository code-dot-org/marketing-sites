# Tasks: Auto Download component

**Input**: Design documents from `/specs/012-auto-download/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by FR-014 (Jest and Storybook `play`).

- **Playwright e2e is omitted**: there's no runtime-contract change (routes, middleware, caching), and a live download plus GA check needs a published Hour of AI page. The manual quickstart check covers that instead (T026).
- **Registration is not tested through the full `hourofai/index.ts` list**: that trips Jest's ESM transforms (see `hourofai/__tests__/definitions.registration.test.ts`). The definition is tested directly, and typecheck/build covers the index.

**Organization**: grouped by user story. US1 is the MVP.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

- Component: `apps/marketing/src/components/contentful/autoDownload/` (abbreviated `autoDownload/` below)
- Registration: `apps/marketing/src/contentful/registration/hourofai/index.ts`
- Stories: `apps/marketing-storybook/stories/AutoDownload.story.tsx`

---

## Phase 1: Setup

**Purpose**: Scaffolding. The review decisions (workspaces, data model, MUI, SEO, cache, privacy) are already recorded in plan.md and research.md.

- [x] T001 Create `autoDownload/` with an `index.ts` exporting `default` from `./AutoDownload` and `AutoDownloadContentfulComponentDefinition` from `./AutoDownloadContentfulDefinition`, mirroring `apps/marketing/src/components/contentful/customText/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure helpers used by every story.

- [x] T002 [P] Implement URL helpers in `autoDownload/startFileDownload.ts`.
  - `toAbsoluteFileUrl(url?: string): string | undefined`: prefix `https:` for `//` URLs; return `undefined` for empty or unparseable input.
  - `getFileName(href: string)`: the decoded last path segment.
  - `getFileExtension(fileName: string)`: lowercase, no dot, `''` if there is none.
  - Add short JSDoc per `docs/code-convention.md`.
- [x] T003 [P] Add unit tests in `autoDownload/__tests__/startFileDownload.test.ts` for the T002 helpers.
  - A protocol-relative `//contentful-assets.code.org/hwu8vzk5v0g2/abc/def/hour-of-ai-toolkit.pdf` becomes `https:`.
  - A `%20`-encoded name decodes.
  - No extension gives `''`.
  - An empty string gives `undefined`.
  - Use synthetic URLs only.

**Checkpoint**: helpers tested; story work can start.

---

## Phase 3: User Story 1 - Visitor gets the file from a short URL (Priority: P1) 🎯 MVP

**Goal**: A published page with the component saves the bound file automatically, and a server-rendered message and fallback link are always present.

**Independent Test**: In Storybook (mocked fetch) and Jest, the component renders the message and link in its initial render, auto-starts one blob download named after the file, doesn't repeat on back/forward, only the first instance starts, and a failure swaps in the failure message.

### Tests for User Story 1

- [x] T004 [P] [US1] Add tests for `startFileDownload(href, fileName, signal)` in `autoDownload/__tests__/startFileDownload.test.ts`.
  - Mock `fetch`, `URL.createObjectURL`, and `URL.revokeObjectURL`, and spy on `HTMLAnchorElement.prototype.click`.
  - Assert `fetch` is called with `{credentials: 'omit', signal}`.
  - Assert the anchor gets `download=fileName` and a `blob:` href, is clicked once, and is removed.
  - With fake timers, assert revoke happens after 30 s.
  - Assert it rejects on `!response.ok`.
  - Assert it rejects with `AbortError` when aborted.
- [x] T005 [P] [US1] Add component tests in `autoDownload/__tests__/AutoDownload.test.tsx`, mocking `../startFileDownload`'s `startFileDownload`.
  - (a) The message has `role="status"`, and the link's `href` is the absolute file URL with text = `linkText`, before any effect settles.
  - (b) Auto-start is called once with the derived name.
  - (c) `autoStart={false}` → not called.
  - (d) Two instances → called once. Unmount the first → a newly mounted instance can claim.
  - (e) A navigation entry of `type: 'back_forward'` whose `name === location.href` → not called. The same type with a different `name` → called.
  - (f) A rejected download → `failMessage` replaces `message` in the same `role="status"` node, and the link remains.
  - (g) An abort rejection → no failure message.
  - (h) No `file` → renders nothing.
  - (i) The link text colour follows the section background: render inside the dark `SectionBackgroundContext` provider and compare with a light one, following `apps/marketing/src/components/contentful/customText/__tests__/CustomText.test.tsx`.

### Implementation for User Story 1

- [x] T006 [US1] Implement `startFileDownload(href, fileName, signal): Promise<void>` in `autoDownload/startFileDownload.ts`, as in research R3.
  - Steps: `fetch` → `blob()` → `URL.createObjectURL` → a temporary `<a download>` appended to `document.body` → `click()` → remove → `setTimeout(revoke, 30_000)`.
  - Throw on a non-OK response.
  - Makes T004 pass.
- [x] T007 [US1] Implement `AutoDownload.tsx` in `autoDownload/`, following data-model.md.
  - **Props**: `file?: string`, `message`, `linkText`, `failMessage` (with the contract defaults), `isEditorMode?: boolean`, `autoStart?: boolean = true`, and `className`.
  - **Render**: an MUI `Box` holding a `Typography` `<p role="status">` whose text colour comes from `useSectionBackground()` (like `customText/CustomText.tsx`). Then the marketing `Link` from `@/components/contentful/link` with `href`, `isLinkExternal={false}` and `linkText`.
  - **Effect**:
    - Skip unless `autoStart`, not `isEditorMode`, and not on a preview host (`PREVIEW_HOSTNAMES` from `@/config/preview` checked against `window.location.host`).
    - Skip on back/forward (R5).
    - Claim the module-level single-instance flag, and release it on cleanup.
    - Create an `AbortController` and call `startFileDownload`. On success set state `started`; on a non-abort error set `failed`.
    - Cleanup aborts and releases.
  - Render `null` when `toAbsoluteFileUrl(file)` is `undefined` and not in the editor.
  - Makes T005 pass.
- [x] T008 [US1] Create `AutoDownloadContentfulDefinition.ts` in `autoDownload/`, exactly as in `contracts/studio-component.md`.
  - `id: 'autoDownload'`, category `08: Advanced`, and the tooltip naming the one-per-page + `noindex` guidance.
  - Variables: `file` (Media, `bindingSourceType: ['asset']`); `message`, `linkText`, `failMessage` (Text with defaults, `['manual', 'entry']`).
  - Reuse an existing generic `thumbnailUrl` (for example Link's).
- [x] T009 [P] [US1] Add a definition contract test in `autoDownload/__tests__/AutoDownloadContentfulDefinition.test.ts`.
  - Assert the id, the four variable names and types, `file`'s `bindingSourceType` equals `['asset']`, and the defaults match the contract.
  - This guards the stored id and the analytics manager's copy expectations.
- [x] T010 [US1] Register the component for Hour of AI in `apps/marketing/src/contentful/registration/hourofai/index.ts`.
  - Entry: `{component: AutoDownload, definition: AutoDownloadContentfulComponentDefinition, options: {enableEditorProperties: {isEditorMode: true}}}`.
  - Place it in the existing alphabetical block.
- [x] T011 [US1] Add Storybook stories in `apps/marketing-storybook/stories/AutoDownload.story.tsx`.
  - Title `Marketing/AutoDownload`, with tags `['autodocs', 'marketing']`.
  - Static states use `autoStart: false`: `Default`, `DarkSection` (wrapped in `Section` with a dark background, like `CustomText.story.tsx`), and `Failed`.
  - `Failed` is best done by mocking `fetch` to reject with `autoStart` true; if that's not deterministic, add a small internal `initialStatus` prop.
  - One `AutoStarts` story mocks `window.fetch` and `URL.createObjectURL` in `beforeEach`, and uses `play` to assert the status and link are present and the mock was called once.
  - Use a synthetic `//contentful-assets.code.org/example/…/sample-toolkit.pdf` URL.
- [x] T012 [US1] Run `yarn workspace @code-dot-org/marketing test` for `autoDownload` and confirm T003–T005 and T009 pass (check the PASS list, not the count).

**Checkpoint**: MVP complete. The component downloads, falls back, and is registered for Hour of AI (Code.org added afterwards).

---

## Phase 4: User Story 2 - Editor replaces the file without engineering help (Priority: P1)

**Goal**: Editors can place, bind, and swap the file in Studio, and auto-download never fires while editing or previewing.

**Independent Test**: Jest shows no download with `isEditorMode` or on a preview host, plus the editor note and the unbound placeholder. Then check in Studio that the picker offers PDFs.

### Tests for User Story 2

- [x] T013 [P] [US2] Extend `autoDownload/__tests__/AutoDownload.test.tsx`.
  - `isEditorMode` → no download call, and the note "Auto-download is off in the editor and preview." is shown.
  - `window.location.host` set to `preview-hourofai.marketing-sites.localhost:3001` → no call, and the same note.
  - Editor mode with no `file` → the placeholder "Choose a file to download." and no link.

### Implementation for User Story 2

- [x] T014 [US2] Add the editor/preview note and the unbound editor placeholder to `autoDownload/AutoDownload.tsx`.
  - The preview-host note is set from the effect, so the server-rendered HTML and the first client render match (no hydration mismatch).
  - Makes T013 pass.
- [x] T015 [P] [US2] Add `EditorMode` and `EditorUnbound` stories to `apps/marketing-storybook/stories/AutoDownload.story.tsx`.
- [x] T016 [US2] **Human (Dee)**: in Hour of AI Studio (sandbox/dev first), add Auto Download to a scratch Experience and confirm the **File** picker offers a PDF asset.
  - If it doesn't, stop and apply the research R1 fallback, which is a separate spec change and a schema proposal for Dee to approve.
- [x] T017 (built by Dee 2026-09-30) [US2] Propose (and, only with Dee's OK, create via MCP) a **draft** `toolkit` Experience in the Hour of AI space with the component bound to Dee's uploaded PDF and SEO `noindex` set.
  - Leave it unpublished (per the Hour of AI publish policy), then re-read the entry to confirm its state.
  - Use the `hourofai-page-build` / `contentful-experience-edit` skill procedure.
  - Record the PDF's actual URL host to close research R2's inference.

**Checkpoint**: editors can build and maintain download pages safely.

---

## Phase 5: User Story 3 - Analytics manager measures downloads without code (Priority: P2)

**Goal**: One `file_download` event per automatic download, with the parameters in `contracts/file-download-event.md`. None for link clicks.

**Independent Test**: Jest asserts the exact payload once on success; nothing on failure, suppression, or link click; and nothing when GA is absent.

### Tests for User Story 3

- [x] T018 [P] [US3] Add tests in `autoDownload/__tests__/sendFileDownloadEvent.test.ts`, mocking `@next/third-parties/google`.
  - With `window.dataLayer` present, `sendGAEvent` is called once with `('event', 'file_download', {file_name: '/hwu8vzk5v0g2/abc/def/hour-of-ai-toolkit.pdf', file_extension: 'pdf', link_url: 'https://…', method: 'auto'})`.
  - Without `dataLayer`, it isn't called until a window `load` event fires, and then once.
  - Still without `dataLayer` after `load`, it isn't called and nothing throws.
- [x] T019 [P] [US3] Extend `autoDownload/__tests__/AutoDownload.test.tsx` with `sendFileDownloadEvent` mocked.
  - Called once after a successful download.
  - Not called on failure, abort, editor, preview, back/forward, or for a second instance.
  - Not called when the fallback link is clicked.

### Implementation for User Story 3

- [x] T020 [US3] Implement `sendFileDownloadEvent({href, fileName})` in `autoDownload/sendFileDownloadEvent.ts`, as in research R6.
  - Build `file_name` from `new URL(href).pathname`, `file_extension` from `getFileExtension`, `link_url` from `href`, and `method: 'auto'`.
  - Call `sendGAEvent` if `window.dataLayer` exists. Otherwise, if `document.readyState !== 'complete'`, retry once on the `load` event, and else drop.
  - Wrap in try/catch so analytics can never affect the download.
  - Makes T018 pass.
- [x] T021 [US3] Call `sendFileDownloadEvent` from the success branch of the effect in `autoDownload/AutoDownload.tsx` (makes T019 pass).

**Checkpoint**: analytics contract implemented. Hour of AI shares Code.org's GA4 id (`src/config/ga4/index.ts`).

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T022 [P] Accessibility pass on the stories (marketing-storybook a11y addon).
  - Zero WCAG AA violations on Default, DarkSection, Failed, and EditorMode.
  - The link is keyboard-focusable.
  - There's no layout shift between the message and the failure message (SC-006).
- [x] T023 Run `yarn lint:fix`, then prettier from each touched workspace (`apps/marketing`, `apps/marketing-storybook`) and on `specs/012-auto-download`, and fix any remaining lint or type errors.
- [x] T024 Run `yarn workspace @code-dot-org/marketing-storybook test:ui:ci`.
  - Report separately whether the new AutoDownload stories passed.
  - Note that new Applitools baselines need accepting in the dashboard.
- [x] T025 Run `yarn release:dryrun` (build, lint, test) from the repo root and report the results.
- [ ] T026 Walk through the quickstart manually on `http://hourofai.marketing-sites.localhost:3001` and `http://preview-hourofai.marketing-sites.localhost:3001`, with the draft page loaded via draft mode or a local fixture.
  - The file saves under its name; back/forward doesn't re-download; the preview host doesn't download; with JS off, the link works.
- [ ] T027 [P] Hand off the analytics setup from `contracts/file-download-event.md` to the analytics manager (via Dee): keep built-in File downloads on, register the `method` dimension, and filter by hostname in the shared Code.org property.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T003)** → the user stories.
- **US1 (T004–T012)**: the MVP. It needs nothing beyond Phase 2.
- **US2 (T013–T017)**: builds on `AutoDownload.tsx` from T007.
  - T016 (Dee in Studio) needs T010 deployed to an environment Studio can load (a dev/sandbox deploy or a local Studio preview).
  - T017 needs T016's OK and Dee's PDF upload.
- **US3 (T018–T021)**: T018 and T020 are independent of US2, and T021 needs T007. It can run in parallel with US2.
- **Polish (T022–T027)**: after the stories you intend to ship.

### Within stories

Write the tests first (T004/T005, T013, T018/T019) and confirm they fail, then implement.

## Parallel Opportunities

- T002 ‖ T003 (the tests can be written against the T002 signatures).
- US1: T004 ‖ T005 ‖ T009. Then T006 → T007 → T008 → T010 → T011.
- US2 ‖ US3 after T007: T013/T015 ‖ T018/T020.

```text
# US1 kickoff
T004 startFileDownload tests   ‖   T005 AutoDownload tests   ‖   T009 definition test
# After T007
T013 (US2 tests)   ‖   T018 (US3 helper tests)   ‖   T020 (US3 helper)
```

## Implementation Strategy

1. **MVP**: Phases 1–3 (T001–T012). This is the smallest slice that proves the download and fallback work, in Jest and Storybook. Don't merge it without US2, because without editor suppression the file downloads on every Studio edit.
2. **Recommended single PR**: US1 + US2 code tasks + US3 (T001–T015, T018–T021), then Polish.
   - T016/T017 are Contentful and human steps after deploy.
3. **Post-merge**: T016 → T017 → Dee reviews and publishes → analytics manager setup (T027).
