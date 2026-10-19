export const FILE_DOWNLOADER_COLOR_OPTIONS = [
  {value: 'black', displayName: 'Black'},
  {value: 'white', displayName: 'White'},
  {value: 'purple', displayName: 'Purple'},
  {value: 'blue', displayName: 'Blue'},
  {value: 'green', displayName: 'Green'},
  {value: 'orange', displayName: 'Orange'},
  {value: 'pink', displayName: 'Pink'},
] as const;

export const FILE_DOWNLOADER_VARIANT_OPTIONS = [
  {value: 'light', displayName: 'Light'},
  {value: 'dark', displayName: 'Dark'},
  {value: 'secondary', displayName: 'Secondary'},
] as const;

export type FileDownloaderColor =
  (typeof FILE_DOWNLOADER_COLOR_OPTIONS)[number]['value'];
export type FileDownloaderVariant =
  (typeof FILE_DOWNLOADER_VARIANT_OPTIONS)[number]['value'];

export const FILE_DOWNLOADER_DEFAULTS = {
  placeholder: 'Select a file',
  color: 'purple',
  variant: 'dark',
} as const satisfies {
  placeholder: string;
  color: FileDownloaderColor;
  variant: FileDownloaderVariant;
};

type Swatch = {
  background: string;
  text: string;
  border: string;
  hoverBackground?: string;
};

const family = (name: string): Record<FileDownloaderVariant, Swatch> => ({
  // Light and Dark match the Badge palette.
  light: {
    background: `var(--codeai-${name}-light)`,
    text: `var(--codeai-${name}-dark)`,
    border: 'transparent',
  },
  dark: {
    background: `var(--codeai-${name}-primary)`,
    text: '#ffffff',
    border: 'transparent',
  },
  // Outlined like the secondary button. Text uses the family dark because
  // blue, green and orange primaries fail AA as text on white.
  secondary: {
    background: 'transparent',
    text: `var(--codeai-${name}-dark)`,
    border: `var(--codeai-${name}-primary)`,
    hoverBackground: `var(--codeai-${name}-light)`,
  },
});

export const FILE_DOWNLOADER_PALETTE: Record<
  FileDownloaderColor,
  Record<FileDownloaderVariant, Swatch>
> = {
  black: {
    light: {
      background: 'var(--codeai-gray-1)',
      text: 'var(--codeai-gray-8)',
      border: 'transparent',
    },
    dark: {
      background: 'var(--codeai-gray-8)',
      text: '#ffffff',
      border: 'transparent',
    },
    secondary: {
      background: 'transparent',
      text: '#000000',
      border: '#000000',
      hoverBackground: 'var(--codeai-purple-light)',
    },
  },
  // White has no badge variant; Light and Dark both render a white fill.
  white: {
    light: {background: '#ffffff', text: '#000000', border: 'transparent'},
    dark: {background: '#ffffff', text: '#000000', border: 'transparent'},
    secondary: {
      background: 'transparent',
      text: '#ffffff',
      border: '#ffffff',
      hoverBackground: 'rgb(255 255 255 / 20%)',
    },
  },
  purple: family('purple'),
  blue: family('blue'),
  green: family('green'),
  orange: family('orange'),
  pink: family('pink'),
};
