// Delay before releasing the blob URL; revoking immediately cancels the save in
// Firefox.
const REVOKE_DELAY_MS = 30_000;

/**
 * Returns an absolute URL for a Contentful file URL, which is protocol-relative
 * (`//contentful-assets.code.org/...`), or `undefined` if it can't be parsed.
 */
export function toAbsoluteFileUrl(url?: string): string | undefined {
  // The Hour of AI space's asset-domain alias returns a stray space after the
  // host (`//contentful-assets.code.org /...`). Contentful URL-encodes file
  // names, so whitespace is never meaningful here.
  const trimmed = url?.replace(/\s/g, '');
  if (!trimmed) return undefined;

  try {
    return new URL(
      trimmed.startsWith('//') ? `https:${trimmed}` : trimmed,
    ).toString();
  } catch {
    return undefined;
  }
}

/** Returns the decoded last path segment, which Contentful sets to the asset's file name. */
export function getFileName(href: string): string {
  const segment = new URL(href).pathname.split('/').pop() ?? '';
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Returns the lowercase extension without the dot, or `''` if there is none. */
export function getFileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}

/**
 * Saves a cross-origin file under `fileName`.
 *
 * `<a download>` is ignored for cross-origin hrefs (the PDF would open in the
 * viewer instead), so the file is fetched and saved from a same-origin blob URL.
 * Rejects on a non-OK response or when `signal` aborts.
 */
export async function startFileDownload(
  href: string,
  fileName: string,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch(href, {credentials: 'omit', signal});
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(blobUrl), REVOKE_DELAY_MS);
}
