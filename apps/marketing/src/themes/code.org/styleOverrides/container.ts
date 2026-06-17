import {Components, Theme} from '@mui/material/styles';

export const CONTAINER_OVERRIDES: Components<Theme>['MuiContainer'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '&.MuiContainer-root': {
        maxWidth: '960px',
        paddingLeft: theme.spacing(0),
        paddingRight: theme.spacing(0),
        zIndex: 2,
      },
      // Spacing styles
      '&.MuiContainer-root.container--spacing-l': {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
      },
      '&.MuiContainer-root.container--spacing-m': {
        paddingTop: theme.spacing(5),
        paddingBottom: theme.spacing(5),
      },
      '&.MuiContainer-root.container--spacing-none': {
        paddingTop: theme.spacing(0),
        paddingBottom: theme.spacing(0),
      },
      // Divider styles
      '&.MuiContainer-root.container--divider-primary': {
        borderBottom: `1px solid var(--background-neutral-quaternary)`,
      },
      '&.MuiContainer-root.container--divider-strong': {
        borderBottom: `1px solid var(--background-neutral-senary)`,
      },
      // Background styles
      '.section-background-primary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-neutral-primary)',
      },
      '.section-background-secondary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-neutral-secondary)',
      },
      '.section-background-dark:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-neutral-black-fixed)',
      },
      '.section-background-brandLightPrimary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-brand-teal-extra-light)',
      },
      '.section-background-brandLightSecondary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-brand-purple-extra-light)',
      },
      '.section-background-patternDark:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-neutral-black-fixed)',
      },
      '.section-background-patternPrimary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--brand-teal-50)',
      },
      '.section-background-transparent:has(&.MuiContainer-root)': {
        backgroundColor: undefined,
      },
      // CodeAI brand-palette section backgrounds. Each maps to its primitive
      // `--codeai-{family}-{shade}` CSS variable. csforall has no equivalent
      // rules — see `apps/marketing/src/themes/csforall/styleOverrides/container.ts`.
      '.section-background-black:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--neutral-base-true-black)',
      },
      '.section-background-white:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--neutral-base-white)',
      },
      '.section-background-purpleDark:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-purple-dark)',
      },
      '.section-background-purplePrimary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-purple-primary)',
      },
      '.section-background-purpleMid:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-purple-mid)',
      },
      '.section-background-purpleLight:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-purple-light)',
      },
      '.section-background-blueDark:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-blue-dark)',
      },
      '.section-background-bluePrimary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-blue-primary)',
      },
      '.section-background-blueMid:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-blue-mid)',
      },
      '.section-background-blueLight:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-blue-light)',
      },
      '.section-background-greenDark:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-green-dark)',
      },
      '.section-background-greenPrimary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-green-primary)',
      },
      '.section-background-greenMid:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-green-mid)',
      },
      '.section-background-greenLight:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-green-light)',
      },
      '.section-background-orangeDark:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-orange-dark)',
      },
      '.section-background-orangePrimary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-orange-primary)',
      },
      '.section-background-orangeMid:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-orange-mid)',
      },
      '.section-background-orangeLight:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-orange-light)',
      },
      '.section-background-pinkDark:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-pink-dark)',
      },
      '.section-background-pinkPrimary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-pink-primary)',
      },
      '.section-background-pinkMid:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-pink-mid)',
      },
      '.section-background-pinkLight:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--codeai-pink-light)',
      },
    }),
  },
};
