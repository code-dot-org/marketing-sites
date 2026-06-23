import {Components, Theme} from '@mui/material/styles';

export const TYPOGRAPHY_OVERRIDES: Components<Theme>['MuiTypography'] = {
  defaultProps: {
    variantMapping: {
      body3: 'p',
      body4: 'p',
    },
  },
  styleOverrides: {
    root: ({theme}) => ({
      color: 'var(--text-neutral-primary)',
      // Paragraph legacy color (non-legacy values render inline via brand color manifest)
      '&.MuiTypography-body1.paragraph--color-secondary, &.MuiTypography-body2.paragraph--color-secondary, &.MuiTypography-body3.paragraph--color-secondary, &.MuiTypography-body4.paragraph--color-secondary':
        {
          color: 'var(--text-neutral-secondary)',
        },
      // Overline styles
      '&.MuiTypography-overline.overline--color-primary': {
        color: 'var(--text-neutral-primary)',
      },
      '&.MuiTypography-overline.overline--color-secondary': {
        color: 'var(--text-neutral-quaternary)',
      },
      '&.MuiTypography-overline.overline--color-white': {
        color: 'var(--neutral-base-white)',
      },
      // Overline size cells routed through the Text-track scale (spec 009 §R5).
      // Note: overline--size-s was 0.625rem (10px) — below the Text scale floor
      // of Text xs (0.75rem / 12px). Clamped up to Text xs. The ~20% visible
      // growth is an intentional, documented change.
      '&.MuiTypography-overline.overline--size-s': {
        fontSize: 'var(--font-size-text-xs)',
      },
      '&.MuiTypography-overline.overline--size-m': {
        fontSize: 'var(--font-size-text-xs)',
      },
      '&.MuiTypography-overline.overline--size-l': {
        fontSize: 'var(--font-size-text-sm)',
      },
      // Caption — routed through Text sm.
      '&.MuiTypography-caption': {
        color: 'var(--text-neutral-primary)',
        fontSize: 'var(--font-size-text-sm)',
        fontWeight: '600',
        margin: theme.spacing(1, 0, 0),
      },
    }),
    gutterBottom: ({theme}) => ({
      '&.MuiTypography-h1': {
        marginBottom: theme.spacing(3), // 24px
      },
      '&.MuiTypography-h2': {
        marginBottom: theme.spacing(2.125), // 16px
      },
      '&.MuiTypography-h3': {
        marginBottom: theme.spacing(1.75), // 14px
      },
      '&.MuiTypography-h4': {
        marginBottom: theme.spacing(1.5), // 12px
      },
      '&.MuiTypography-h5': {
        marginBottom: theme.spacing(1.125), // 10px
      },
      '&.MuiTypography-h6': {
        marginBottom: theme.spacing(1), // 8px
      },
      '&.MuiTypography-body1': {
        marginBottom: theme.spacing(2), // 16px
      },
      '&.MuiTypography-body2': {
        marginBottom: theme.spacing(2), // 16px
      },
      '&.MuiTypography-body3': {
        marginBottom: theme.spacing(1.5), // 12px
      },
      '&.MuiTypography-body4': {
        marginBottom: theme.spacing(1.25), // 10px
      },
      '&.MuiTypography-overline': {
        marginBottom: theme.spacing(2), // 16px
      },
      '&.MuiTypography-caption': {
        marginBottom: theme.spacing(2), // 16px
      },
    }),
  },
};
