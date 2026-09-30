# Data Model: Auto Download component

No Contentful content type or schema change. The only authored data is a component instance's variables in Studio.

## Auto Download instance (Studio component variables)

| Variable              | Type  | Binding           | Default                                     | Notes                                                                                                                  |
| --------------------- | ----- | ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `file`                | Media | `asset`           | none                                        | Required for the component to do anything.                                                                             |
| `message`             | Text  | `manual`, `entry` | `Your download should start automatically.` | Localizable.                                                                                                           |
| `linkText`            | Text  | `manual`, `entry` | `If it doesn't, download the file here.`    | Localizable. Text of the fallback link.                                                                                |
| `failMessage`         | Text  | `manual`, `entry` | `The download didn't start automatically.`  | Localizable. Replaces `message` on failure.                                                                            |
| `analyticsParameters` | Text  | `manual`          | none                                        | Optional `name=value` pairs sent with every download event; parsed and validated per contracts/file-download-event.md. |

Editor-only prop injected by the SDK: `isEditorMode` (from `enableEditorProperties`).
Internal prop, not in the Studio definition: `autoStart?: boolean` (default `true`). Stories use it to render a static state.

### Derived values

- `href` = `https:` + `file` when the URL is protocol-relative.
- `fileName` = the decoded last path segment of `href`, used as the save name.
- `fileExtension` = the lowercase text after the final `.` in `fileName`, with no dot.
- `filePath` = the URL pathname, used as GA `file_name` to match the built-in tracking.

### Validation

- `file` empty → render nothing on the live site. In the editor, show "Choose a file to download."
- A URL that fails to parse is treated as empty.

## Download state (client, per instance)

```text
            ┌──────── editor / preview host / back-forward / not first instance / autoStart=false
            ▼
 idle ──► suppressed            (message + link; editor/preview shows "Auto-download is off here")
  │
  └─► starting ──► started      (download saved; analytics event sent)
            └────► failed       (failMessage announced; link remains)
```

- Every state shows the fallback link.
- The automatic download's analytics event is sent only when entering `started`. A fallback-link click sends its own event (`method: 'link'`) in any state except the editor and preview.
- An aborted request (unmount or Strict Mode cleanup) returns to `idle` with no event.

## Download event (analytics)

See [contracts/file-download-event.md](contracts/file-download-event.md). The event holds file metadata only and no personal data.
