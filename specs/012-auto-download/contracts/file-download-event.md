# Contract: `file_download` analytics event

The analytics manager relies on this event to build per-file events and reports without code changes. Changing the name or parameters is a breaking change.

## Sent by the component (automatic download)

```js
gtag('event', 'file_download', {
  file_name: '/hwu8vzk5v0g2/<assetId>/<hash>/hour-of-ai-toolkit.pdf', // URL path
  file_extension: 'pdf', // no leading dot
  link_url:
    'https://contentful-assets.code.org/hwu8vzk5v0g2/<assetId>/<hash>/hour-of-ai-toolkit.pdf',
  method: 'auto',
});
```

- Sent once per automatic download, after the file has been fetched and the save has started.
- Not sent in the editor, in preview, on back/forward, by non-first instances, or on failure.
- Sent through the site's existing GA integration only. When GA is absent, blocked, or not consented, the event is dropped without affecting the download.

## Sent by GA4 built-in tracking (fallback link click)

GA4's built-in file-download tracking sends the same event name with `file_name`, `file_extension`, `link_url`, `link_text` (plus `link_id` and `link_classes`), and **no** `method`. The component sends nothing for link clicks.

## Reporting guidance for the analytics manager

- A per-file event is `file_download` where `file_name` contains the file name (for example `hour-of-ai-toolkit.pdf`). Match on the name, not the full path, because the path's hash changes each time the file is replaced.
- Split automatic downloads from link clicks with the `method` custom dimension. `auto` means an automatic download, and `(not set)` means a link click.
- Prerequisites:
  - "File downloads" is switched on in the property's built-in tracking.
  - `method` is registered as an event-scoped custom dimension.
  - Hour of AI shares the Code.org property, so filter by hostname `hourofai.org` to separate it.

## Privacy

The event carries file metadata only. It goes to the existing analytics provider, behind the existing OneTrust consent. No new recipient, no identifiers, no student data.
