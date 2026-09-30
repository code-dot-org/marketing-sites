# Contract: Studio component definition

```ts
{
  id: 'autoDownload',
  name: 'Auto Download',
  category: '08: Advanced',
  tooltip: {
    description:
      'Starts downloading the chosen file when the page loads, with a fallback link. ' +
      'Use one per page and mark the page noindex in its SEO settings.',
  },
  variables: {
    file:        {displayName: 'File', type: 'Media', group: 'content',
                  validations: {bindingSourceType: ['asset']}},
    message:     {displayName: 'Message', type: 'Text', group: 'content',
                  defaultValue: 'Your download should start automatically.',
                  validations: {bindingSourceType: ['manual', 'entry']}},
    linkText:    {displayName: 'Link text', type: 'Text', group: 'content',
                  defaultValue: "If it doesn't, download the file here.",
                  validations: {bindingSourceType: ['manual', 'entry']}},
    failMessage: {displayName: 'Message if the download fails', type: 'Text', group: 'content',
                  defaultValue: "The download didn't start automatically.",
                  validations: {bindingSourceType: ['manual', 'entry']}},
  },
}
```

Registered for Hour of AI and Code.org, each with `options.enableEditorProperties: {isEditorMode: true}`.

- The component `id` is stored in Experience component trees. Renaming it later orphans placed instances.
- The `id` must not collide with an existing component id. Checked against the repo's registrations on 2026-09-30: no `autoDownload` exists.

## Rendered HTML (server output, before hydration)

```html
<div class="…">
  <p role="status">Your download should start automatically.</p>
  <p>
    <a
      href="https://contentful-assets.code.org/…/hour-of-ai-toolkit.pdf"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="If it doesn't, download the file here. (opens in a new tab)"
      >If it doesn't, download the file here.</a
    >
  </p>
</div>
```

- Both elements are present without JavaScript.
- In the editor or on the preview host, a note is added after the link: "Auto-download is off in the editor and preview."
