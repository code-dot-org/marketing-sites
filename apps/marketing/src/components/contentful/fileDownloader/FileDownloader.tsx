'use client';

import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {styled} from '@mui/material/styles';
import {useEffect, useId, useMemo, useRef, useState} from 'react';

import {sendFileDownloadEvent} from '@/components/contentful/autoDownload/sendFileDownloadEvent';
import {
  getFileName,
  startFileDownload,
  toAbsoluteFileUrl,
} from '@/components/contentful/autoDownload/startFileDownload';
import Paragraph from '@/components/contentful/paragraph';
import {PREVIEW_HOSTNAMES} from '@/config/preview';
import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {FileDownloadEntry} from '@/types/contentful/entries/FileDownload';

import {
  FILE_DOWNLOADER_DEFAULTS,
  FILE_DOWNLOADER_PALETTE,
  FileDownloaderColor,
  FileDownloaderVariant,
} from './constants';

const FILE_DOWNLOAD_CONTENT_TYPE = 'fileDownload';

type FileDownloaderProps = {
  /** List items; entries other than File Download are skipped. */
  files?: FileDownloadEntry[];
  /** Dropdown label */
  placeholder?: string;
  /** Color family */
  color?: FileDownloaderColor;
  /** Light or Dark fill (Badge colors), or an outlined Secondary */
  variant?: FileDownloaderVariant;
  /** Injected by the Experiences SDK in Studio. */
  isEditorMode?: boolean;
  className?: string;
};

type DownloadOption = {
  id: string;
  label: string;
  href: string;
  /** Contentful assets are saved in place; external URLs open in a new tab. */
  isAsset: boolean;
};

// Label and options use the default Paragraph style (text-md → body2).
const Trigger = styled(ButtonBase)(({theme}) => ({
  ...theme.typography.body2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
  width: '100%',
  padding: theme.spacing(0.75, 2),
  // Every style keeps the 2px border so switching styles never resizes it.
  border: '2px solid transparent',
  borderRadius: codeaiRadius('sm', '4px'),
  textAlign: 'start',
  '&:focus-visible': {
    outline: '2px solid var(--codeai-purple-primary)',
    outlineOffset: '2px',
  },
  '& .file-downloader-caret': {
    flexShrink: 0,
    color: 'inherit',
    fontSize: '1.25rem',
    transition: 'transform 150ms ease',
    '@media (prefers-reduced-motion: reduce)': {transition: 'none'},
  },
  '&[aria-expanded="true"] .file-downloader-caret': {
    transform: 'rotate(180deg)',
  },
}));

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

const isPreviewHost = () => PREVIEW_HOSTNAMES.has(window.location.host);

const isWebUrl = (href: string) => /^https?:$/.test(new URL(href).protocol);

const FileDownloader: React.FunctionComponent<FileDownloaderProps> = ({
  files,
  placeholder = FILE_DOWNLOADER_DEFAULTS.placeholder,
  color = FILE_DOWNLOADER_DEFAULTS.color,
  variant = FILE_DOWNLOADER_DEFAULTS.variant,
  isEditorMode = false,
  className,
}) => {
  const inMemoryEntities = useInMemoryEntities();
  const triggerId = useId();
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const options = useMemo(() => {
    // Bound list items, and the assets nested in them, can arrive as
    // unresolved {sys: {type: 'Link'}} stubs.
    const resolve = <T,>(maybeLink: unknown): T | undefined =>
      (maybeLink as {sys?: {type?: string}})?.sys?.type === 'Link'
        ? (inMemoryEntities.maybeResolveLink(maybeLink as never) as T)
        : (maybeLink as T | undefined);

    return (files ?? []).flatMap((item): DownloadOption[] => {
      const entry = resolve<FileDownloadEntry>(item);
      if (entry?.sys?.contentType?.sys?.id !== FILE_DOWNLOAD_CONTENT_TYPE) {
        return [];
      }
      const {fileTitle, title, fileAsset, externalFileUrl} = entry.fields;
      const label = fileTitle || title;
      const asset =
        resolve<FileDownloadEntry['fields']['fileAsset']>(fileAsset);
      const assetHref = toAbsoluteFileUrl(asset?.fields?.file?.url);
      const externalHref = toAbsoluteFileUrl(externalFileUrl);
      const id = entry.sys.id;

      if (!label) return [];
      if (assetHref) return [{id, label, href: assetHref, isAsset: true}];
      // Only web URLs, so an authored `javascript:` value never opens.
      if (externalHref && isWebUrl(externalHref)) {
        return [{id, label, href: externalHref, isAsset: false}];
      }
      return [];
    });
  }, [files, inMemoryEntities]);

  const swatch =
    FILE_DOWNLOADER_PALETTE[color]?.[variant] ??
    FILE_DOWNLOADER_PALETTE[FILE_DOWNLOADER_DEFAULTS.color][
      FILE_DOWNLOADER_DEFAULTS.variant
    ];

  const handleSelect = (option: DownloadOption) => {
    setAnchorEl(null);
    const fileName = getFileName(option.href);

    if (!isEditorMode && !isPreviewHost()) {
      sendFileDownloadEvent({
        href: option.href,
        fileName,
        method: 'dropdown',
      });
    }

    if (!option.isAsset) {
      setStatus(`Opening ${option.label} in a new tab.`);
      window.open(option.href, '_blank', 'noopener,noreferrer');
      return;
    }

    setStatus(`Downloading ${option.label}.`);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    startFileDownload(option.href, fileName, controller.signal).catch(error => {
      if (controller.signal.aborted) return;
      // Falls back to opening the file directly; the user activation that
      // window.open would need was spent on the fetch.
      console.warn('File Downloader: the file could not be saved', error);
      window.location.assign(option.href);
    });
  };

  if (options.length === 0) {
    return isEditorMode ? (
      <Box className={className}>
        <Paragraph removeMarginBottom>
          Bind a List of File Download entries.
        </Paragraph>
      </Box>
    ) : null;
  }

  const isOpen = Boolean(anchorEl);

  return (
    <Box className={className} sx={{width: '100%'}}>
      <Trigger
        id={triggerId}
        aria-haspopup="true"
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen ? 'true' : undefined}
        onClick={event => setAnchorEl(event.currentTarget)}
        disableRipple
        sx={{
          backgroundColor: swatch.background,
          color: swatch.text,
          borderColor: swatch.border,
          '&:hover': swatch.hoverBackground
            ? {backgroundColor: swatch.hoverBackground}
            : // An overlay darkens any fill without a per-color hover token.
              {
                backgroundImage:
                  'linear-gradient(rgb(0 0 0 / 8%), rgb(0 0 0 / 8%))',
              },
        }}
      >
        {placeholder}
        <KeyboardArrowDownIcon
          className="file-downloader-caret"
          aria-hidden="true"
        />
      </Trigger>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={isOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        transformOrigin={{vertical: 'top', horizontal: 'left'}}
        slotProps={{
          list: {
            'aria-labelledby': triggerId,
            // Undo the theme's content-list override (inline-start padding,
            // gap, margin, flex-start items) so options span the menu.
            sx: {
              paddingBlock: 0.5,
              paddingInline: 0,
              margin: 0,
              gap: 0,
              alignItems: 'stretch',
            },
          },
          paper: {
            elevation: 0,
            sx: {
              marginTop: 0.5,
              width: anchorEl?.offsetWidth,
              border: '1px solid var(--borders-neutral-primary)',
              borderRadius: codeaiRadius('md', '4px'),
            },
          },
        }}
      >
        {options.map(option => (
          <MenuItem
            key={option.id}
            onClick={() => handleSelect(option)}
            sx={theme => ({
              ...theme.typography.body2,
              width: '100%',
              minHeight: 'auto',
              paddingBlock: 1.25,
              paddingInline: 1.5,
              whiteSpace: 'normal',
            })}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
      <Box role="status" sx={visuallyHidden}>
        {status}
      </Box>
    </Box>
  );
};

export default FileDownloader;
