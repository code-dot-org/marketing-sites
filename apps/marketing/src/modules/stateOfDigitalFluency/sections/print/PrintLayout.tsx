import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import type {SxProps, Theme} from '@mui/material/styles';
import type {ReactNode} from 'react';

import {
  Link,
  Paragraph,
  Section,
} from '@/components/dataDisplay/brandComponents';
import {CODEAI} from '@/components/dataDisplay/codeaiColors';
import {
  CODE_ORG_DISPLAY_FONT_STACK,
  CODE_ORG_TEXT_FONT_STACK,
} from '@/themes/code.org/typography/fontStack';

import {REPORT_TITLE} from '../../constants';
import type {TierLabel} from '../../types';

import styles from './print.module.scss';

/** The prototype's ink and muted text (AA on white). */
export const INK = '#1a1a1a';
export const MUTED = CODEAI.gray6;
/** The prototype's lavender panel fill. */
export const PURPLE_BG = '#EEEDF9';

/**
 * Each tier's hero gradient stops: the tier colour, easing to a lighter
 * shade. Purple stops short of Purple Mid so white text keeps AA.
 */
export const TIER_GRADIENT_STOPS: Record<TierLabel, [string, string]> = {
  Transformative: [CODEAI.purplePrimary, '#6A61D8'],
  Developing: [CODEAI.bluePrimary, CODEAI.blueMid],
  Emerging: [CODEAI.orangePrimary, CODEAI.orangeMid],
};

export const TIER_GRADIENTS = Object.fromEntries(
  Object.entries(TIER_GRADIENT_STOPS).map(([tier, [from, to]]) => [
    tier,
    `linear-gradient(180deg, ${from} 0%, ${from} 60%, ${to} 100%)`,
  ]),
) as Record<TierLabel, string>;

/**
 * Text on a tier gradient. The prototype uses white throughout, but white on
 * the orange and blue tiers is 3.1:1, under AA; ink there is 6:1.
 */
export const TIER_GRADIENT_TEXT: Record<TierLabel, string> = {
  Transformative: CODEAI.white,
  Developing: CODEAI.gray9,
  Emerging: CODEAI.gray9,
};

export const displayFont = {fontFamily: CODE_ORG_DISPLAY_FONT_STACK};

/** A heading in the display face. */
export function PrintHeading({
  level,
  children,
  sx,
}: {
  level: 'h1' | 'h2' | 'h3';
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      component={level}
      sx={[
        {...displayFont, m: 0, fontWeight: 700, lineHeight: 1.25},
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

/** The prototype's white card, its title a centred purple h2. */
export function PrintCard({
  title,
  children,
  sx,
}: {
  title?: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={[
        {
          background: '#fff',
          border: '1px solid #ECECEC',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgb(0 0 0 / 8%)',
          px: '18px',
          py: '12px',
          minWidth: 0,
          breakInside: 'avoid',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {title && (
        <PrintHeading
          level="h2"
          sx={{
            textAlign: 'center',
            color: CODEAI.purplePrimary,
            fontSize: '16px',
            mb: '6px',
          }}
        >
          {title}
        </PrintHeading>
      )}
      {children}
    </Box>
  );
}

/** The lavender title band at the top of the profile, breakdown and rankings pages. */
export function HeaderBand({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <Box
      sx={{
        background: CODEAI.purpleLight,
        borderRadius: '12px',
        px: '22px',
        py: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      {children}
      {aside && (
        <Box sx={{fontSize: '12px', color: '#333', textAlign: 'right'}}>
          {aside}
        </Box>
      )}
    </Box>
  );
}

/** One US Letter sheet: a label in the corner, content, and a centred footer. */
export function PrintPage({
  label,
  footer,
  children,
}: {
  label: string;
  footer: string;
  children: ReactNode;
}) {
  return (
    <Box
      component="section"
      aria-label={label}
      data-print-page
      className={styles.page}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '10px',
          right: '18px',
          fontSize: '10px',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: MUTED,
        }}
      >
        {label}
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        {children}
      </Box>
      <Box
        component="footer"
        sx={{
          position: 'absolute',
          bottom: '8px',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '10px',
          color: MUTED,
        }}
      >
        {footer}
      </Box>
    </Box>
  );
}

/** The footer line: title, year, edition and "Data as of". */
export const footerText = (...parts: (string | null | undefined)[]) =>
  [REPORT_TITLE, ...parts].filter(Boolean).join(' · ');

/** A year-over-year change pill: green up, red down, nothing when flat. */
export function DeltaTag({
  value,
  suffix = '',
  digits = 1,
}: {
  value: number | null;
  suffix?: string;
  digits?: number;
}) {
  if (value == null || value === 0) {
    return null;
  }
  const up = value > 0;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        fontWeight: 700,
        px: '8px',
        py: '1px',
        borderRadius: '12px',
        color: up ? '#2E7D32' : '#C8361A',
        background: up ? '#E6F4EA' : '#FCE4DE',
      }}
    >
      <Box component="span" aria-hidden sx={{fontSize: '10px'}}>
        {up ? '▲' : '▼'}
      </Box>
      {`${up ? '+' : ''}${value.toFixed(digits)}${suffix}`}
    </Box>
  );
}

// Page-level print rules. Global, so they can't live in the CSS module.
const printGlobals = {
  '@media print': {
    // Hide the site header, footer and anything else beside the report's <main>.
    '*:has(> main [data-sodf-print]) > :not(main)': {
      display: 'none !important',
    },
    // The report's sheets are the print: no section padding or background.
    'main:has([data-sodf-print]) .section-root': {
      background: 'none !important',
      padding: '0 !important',
    },
    'main:has([data-sodf-print]) .section-root > .MuiContainer-root': {
      padding: '0 !important',
      maxWidth: 'none !important',
    },
  },
};

/** The printable report: a print link on screen, then letter pages. */
export default function PrintLayout({
  back,
  children,
}: {
  /** The page this report prints. */
  back: {href: string; label: string};
  children: ReactNode;
}) {
  return (
    <Section background="gray1" padding="m">
      <Box
        className={styles.report}
        data-sodf-print
        sx={{fontFamily: CODE_ORG_TEXT_FONT_STACK, color: INK, lineHeight: 1.5}}
      >
        <GlobalStyles styles={printGlobals} />
        <Box
          component="nav"
          aria-label="Printable report"
          className={styles.toolbar}
        >
          <Link
            href={back.href}
            isLinkExternal={false}
            icon="arrow-left"
            iconPosition="left"
            removeMarginBottom
          >
            {back.label}
          </Link>
          <Paragraph visualAppearance="text-sm" removeMarginBottom>
            Use your browser&apos;s Print command to print or save as PDF.
          </Paragraph>
        </Box>
        {children}
      </Box>
    </Section>
  );
}
