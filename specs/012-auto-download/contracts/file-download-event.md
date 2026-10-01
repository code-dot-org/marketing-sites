# Contract: `file_download` analytics event

The analytics manager relies on this event to build per-file events and reports without code changes. Changing the name or parameters is a breaking change.

## Sent by the component (automatic download and fallback-link click)

```js
gtag('event', 'file_download', {
  // Authored "Analytics parameters" from Studio come first, so they can never
  // overwrite the fields below.
  download_campaign: 'springplcourse',
  file_name: '/hwu8vzk5v0g2/<assetId>/<hash>/hour-of-ai-toolkit.pdf', // URL path
  file_extension: 'pdf', // no leading dot
  link_url:
    'https://contentful-assets.code.org/hwu8vzk5v0g2/<assetId>/<hash>/hour-of-ai-toolkit.pdf',
  method: 'auto', // or 'link'
});
```

- `method: 'auto'` is sent once per automatic download, after the file has been fetched and the save has started. It isn't sent in the editor, in preview, on back/forward, by non-first instances, or on failure.
- `method: 'link'` is sent once per fallback-link click. It isn't sent in the editor or in preview.
- Sent through the site's existing GA integration only. When GA is absent, blocked, or not consented, the event is dropped without affecting the download.

## GA4 built-in tracking is suppressed for the fallback link

GA's built-in file-download tracking (and its outbound `click` event) listens for clicks at the document level. The component stops the fallback link's click on the link's wrapper, before it reaches that listener, so each click is counted once and always carries the authored parameters. Verified in the browser against the live gtag on 2026-09-30. If Google moves that listener to the capture phase, link clicks would be double-counted again, so re-check after any big gtag change.

## Authored analytics parameters

The Studio field **Analytics parameters** takes `name=value` pairs separated by commas or new lines, for example `download_campaign=springplcourse, download_content=hero`.

- Names: letters, numbers, and underscores, starting with a letter, up to 40 characters. Values: up to 100 characters. Up to 20 pairs.
- Rejected and never sent:
  - the event's own fields (`file_name`, `file_extension`, `link_url`, `link_text`, `link_id`, `link_classes`, `method`)
  - GA page and campaign fields (`page_location`, `page_referrer`, `page_title`, `campaign`, `campaign_id`, `source`, `medium`, `term`, `content`, `language`, `screen_resolution`, `engagement_time_msec`, `session_id`, `session_number`)
  - anything starting with `google_`, `ga_` or `firebase_`
  - duplicates and empty values
- In the Studio editor and on preview, the component lists the pairs it will send and the ones it ignored, with the reason.
- Each name must be registered as an event-scoped custom dimension in GA before it appears in reports. Registration isn't retroactive.

## Reporting guidance for the analytics manager

- A per-file event is `file_download` where `file_name` contains the file name (for example `hour-of-ai-toolkit.pdf`). Match on the name, not the full path, because the path's hash changes each time the file is replaced.
- Split automatic downloads from link clicks with the `method` custom dimension: `auto` or `link`.
- Split by campaign or content with the authored parameters' custom dimensions.
- Hour of AI shares the Code.org property, so filter by hostname `hourofai.org` to separate it.

## Privacy

The event carries file metadata and short authored labels only. It goes to the existing analytics provider, behind the existing OneTrust consent. No new recipient, no identifiers, no student data. The Studio field's description tells editors not to enter personal data.
