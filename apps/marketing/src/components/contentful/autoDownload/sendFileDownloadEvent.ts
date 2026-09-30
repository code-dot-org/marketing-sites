import {sendGAEvent} from '@next/third-parties/google';

import {getFileExtension} from './startFileDownload';

type FileDownloadEvent = {
  href: string;
  fileName: string;
  method: 'auto' | 'link';
  /** Authored parameters, already validated by parseAnalyticsParameters. */
  parameters?: Record<string, string>;
};

const send = ({href, fileName, method, parameters}: FileDownloadEvent) => {
  // Parameter meanings match GA4's built-in file_download event so both
  // sources report together. See specs/012-auto-download/contracts.
  // Authored parameters go first so they can never overwrite these fields.
  sendGAEvent('event', 'file_download', {
    ...parameters,
    file_name: new URL(href).pathname,
    file_extension: getFileExtension(fileName),
    link_url: href,
    method,
  });
};

const hasDataLayer = () =>
  Array.isArray((window as {dataLayer?: unknown}).dataLayer);

/**
 * Reports a download (automatic or fallback-link click) to GA4. The GA init script is injected
 * after hydration, so if it hasn't run yet this retries once on window `load`
 * and then drops the event. Never throws.
 */
export function sendFileDownloadEvent(event: FileDownloadEvent): void {
  try {
    if (hasDataLayer()) {
      send(event);
    } else if (document.readyState !== 'complete') {
      window.addEventListener(
        'load',
        () => {
          if (hasDataLayer()) send(event);
        },
        {once: true},
      );
    }
  } catch {
    // Analytics must never affect the download.
  }
}
