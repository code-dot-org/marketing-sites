'use client';

import Box from '@mui/material/Box';
import {type ReactNode, useEffect, useRef} from 'react';

import {sendFileDownloadEvent} from '@/components/contentful/autoDownload/sendFileDownloadEvent';
import {getFileName} from '@/components/contentful/autoDownload/startFileDownload';
import {PREVIEW_HOSTNAMES} from '@/config/preview';

/**
 * Sends the site's GA file_download event when the wrapped link is clicked,
 * like the Contentful download components. The click stops here so GA's
 * built-in file-download tracking doesn't count it a second time.
 */
export default function DownloadTracker({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrapper = ref.current;
    if (!wrapper) return;

    const onClick = (event: MouseEvent) => {
      event.stopPropagation();
      if (PREVIEW_HOSTNAMES.has(window.location.host)) return;
      try {
        // The File Download entry also allows site paths.
        const absolute = new URL(href, window.location.origin).toString();
        sendFileDownloadEvent({
          href: absolute,
          fileName: getFileName(absolute),
          method: 'link',
        });
      } catch {
        // Analytics must never affect the download.
      }
    };

    wrapper.addEventListener('click', onClick);
    return () => wrapper.removeEventListener('click', onClick);
  }, [href]);

  // display: contents keeps the button in the hero's flex row.
  return (
    <Box component="span" ref={ref} sx={{display: 'contents'}}>
      {children}
    </Box>
  );
}
