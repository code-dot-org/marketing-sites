import {sendGAEvent} from '@next/third-parties/google';

import {getFileExtension} from './startFileDownload';

type FileDownloadEvent = {href: string; fileName: string};

const send = ({href, fileName}: FileDownloadEvent) => {
  // Parameter meanings match GA4's built-in file_download event so both
  // sources report together. See specs/012-auto-download/contracts.
  sendGAEvent('event', 'file_download', {
    file_name: new URL(href).pathname,
    file_extension: getFileExtension(fileName),
    link_url: href,
    method: 'auto',
  });
};

const hasDataLayer = () =>
  Array.isArray((window as {dataLayer?: unknown}).dataLayer);

/**
 * Reports an automatic download to GA4. The GA init script is injected
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
