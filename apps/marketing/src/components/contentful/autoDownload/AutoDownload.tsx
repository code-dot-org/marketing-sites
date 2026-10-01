'use client';

import Box from '@mui/material/Box';
import {useEffect, useMemo, useRef, useState} from 'react';

import Link from '@/components/contentful/link';
import Paragraph from '@/components/contentful/paragraph';
import {PREVIEW_HOSTNAMES} from '@/config/preview';

import {AUTO_DOWNLOAD_DEFAULTS} from './AutoDownloadContentfulDefinition';
import {parseAnalyticsParameters} from './parseAnalyticsParameters';
import {sendFileDownloadEvent} from './sendFileDownloadEvent';
import {
  getFileName,
  startFileDownload,
  toAbsoluteFileUrl,
} from './startFileDownload';

type AutoDownloadProps = {
  /** Contentful file URL, bound from an asset. */
  file?: string;
  message?: string;
  linkText?: string;
  failMessage?: string;
  /** Authored `name=value` pairs sent with the download event. */
  analyticsParameters?: string;
  /** Injected by the Experiences SDK in Studio. */
  isEditorMode?: boolean;
  /** Not authorable; lets stories render static states. */
  autoStart?: boolean;
  className?: string;
};

// One automatic download per page: the first mounted instance claims it and
// releases it on unmount.
let isClaimed = false;

const isPreviewHost = () => PREVIEW_HOSTNAMES.has(window.location.host);

// Skips re-downloading when the visitor returns with back/forward. Compares
// the URL so a later client-side navigation to this page still downloads.
const isBackForwardReturn = () => {
  const [entry] =
    typeof performance.getEntriesByType === 'function'
      ? performance.getEntriesByType('navigation')
      : [];
  const navigation = entry as PerformanceNavigationTiming | undefined;
  return (
    navigation?.type === 'back_forward' &&
    navigation.name === window.location.href
  );
};

const AutoDownload: React.FunctionComponent<AutoDownloadProps> = ({
  file,
  message = AUTO_DOWNLOAD_DEFAULTS.message,
  linkText = AUTO_DOWNLOAD_DEFAULTS.linkText,
  failMessage = AUTO_DOWNLOAD_DEFAULTS.failMessage,
  analyticsParameters,
  isEditorMode = false,
  autoStart = true,
  className,
}) => {
  const href = toAbsoluteFileUrl(file);
  // Memoized on the authored string so the effect below doesn't re-run
  // (and re-download) on every render.
  const {parameters, rejected} = useMemo(
    () => parseAnalyticsParameters(analyticsParameters),
    [analyticsParameters],
  );
  const [hasFailed, setHasFailed] = useState(false);
  // Preview is only detectable client-side, so it's set from the effect to
  // keep the server and first client render identical.
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (!href || !autoStart || isEditorMode) return;
    if (isPreviewHost()) {
      setIsPreview(true);
      return;
    }
    if (isBackForwardReturn() || isClaimed) return;

    isClaimed = true;
    const controller = new AbortController();
    const fileName = getFileName(href);

    startFileDownload(href, fileName, controller.signal)
      .then(() =>
        sendFileDownloadEvent({href, fileName, method: 'auto', parameters}),
      )
      .catch(error => {
        if (controller.signal.aborted) return;
        console.warn('Auto Download: the file could not be downloaded', error);
        setHasFailed(true);
      });

    return () => {
      controller.abort();
      isClaimed = false;
    };
  }, [href, autoStart, isEditorMode, parameters]);

  // Reports fallback-link clicks ourselves so the authored parameters go with
  // them. The native listener stops the click before it reaches GA's
  // document-level file-download tracking, which would otherwise count the
  // same click again without the parameters.
  const linkWrapperRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const wrapper = linkWrapperRef.current;
    if (!wrapper || !href) return;

    const onClick = (event: MouseEvent) => {
      event.stopPropagation();
      if (isEditorMode || isPreviewHost()) return;
      sendFileDownloadEvent({
        href,
        fileName: getFileName(href),
        method: 'link',
        parameters,
      });
    };

    wrapper.addEventListener('click', onClick);
    return () => wrapper.removeEventListener('click', onClick);
  }, [href, isEditorMode, parameters]);

  if (!href) {
    return isEditorMode ? (
      <Box className={className}>
        <Paragraph removeMarginBottom>Choose a file to download.</Paragraph>
      </Box>
    ) : null;
  }

  return (
    // alignItems: inherit follows the Studio container's horizontal alignment.
    <Box
      className={className}
      sx={{display: 'flex', flexDirection: 'column', alignItems: 'inherit'}}
    >
      <Box role="status">
        <Paragraph removeMarginBottom={false}>
          {hasFailed ? failMessage : message}
        </Paragraph>
      </Box>
      {/* Inline inside a Paragraph so the link takes the brand body font;
          Hour of AI has no standalone Link theme styles. */}
      <Paragraph removeMarginBottom>
        <Box component="span" ref={linkWrapperRef}>
          <Link
            href={href}
            isLinkExternal={false}
            openInNewTab
            ariaLabel={`${linkText} (opens in a new tab)`}
            inline
            removeMarginBottom
          >
            {linkText}
          </Link>
        </Box>
      </Paragraph>
      {(isEditorMode || isPreview) && (
        <Box sx={{marginTop: '1rem'}}>
          <Paragraph visualAppearance="text-sm" removeMarginBottom>
            Auto-download is off in the editor and preview.
          </Paragraph>
          {Object.keys(parameters).length > 0 && (
            <Paragraph visualAppearance="text-sm" removeMarginBottom>
              Analytics parameters:{' '}
              {Object.entries(parameters)
                .map(([name, value]) => `${name}=${value}`)
                .join(', ')}
            </Paragraph>
          )}
          {rejected.length > 0 && (
            <Paragraph visualAppearance="text-sm" removeMarginBottom>
              Ignored analytics parameters:{' '}
              {rejected
                .map(({entry, reason}) => `${entry} (${reason})`)
                .join(', ')}
            </Paragraph>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AutoDownload;
