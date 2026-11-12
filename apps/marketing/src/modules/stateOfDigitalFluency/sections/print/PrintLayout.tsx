import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import type {ReactNode} from 'react';

import type {BrandColor} from '@/components/common/colors';
import {SectionBackgroundProvider} from '@/components/contentful/section/SectionBackgroundContext';
import {
  CustomText,
  Heading,
  Link,
  Paragraph,
  Section,
} from '@/components/dataDisplay/brandComponents';
import {
  type CodeaiColor,
  codeaiVar,
} from '@/components/dataDisplay/codeaiColors';
import {codeaiRadius} from '@/themes/code.org/constants/radius';

import {REPORT_TITLE} from '../../constants';
import {DataAsOf} from '../common';

import styles from './print.module.scss';

const exactColors = {
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
} as const;

/** A heading at the printable report's scale. */
export function PrintHeading({
  level,
  children,
}: {
  level: 'h1' | 'h2' | 'h3';
  children: ReactNode;
}) {
  const appearance = {
    h1: 'heading-xxl',
    h2: 'heading-xl',
    h3: 'heading-lg',
  } as const;
  const fontSize = {h1: 1.75, h2: 1, h3: 0.8125};
  return (
    <Heading
      visualAppearance={appearance[level]}
      fontSize={fontSize[level]}
      lineHeight={1.25}
      removeMarginBottom={level === 'h1'}
    >
      {children}
    </Heading>
  );
}

/** A bordered block (borders print where backgrounds may not). */
export function PrintPanel({
  title,
  children,
}: {
  /** Rendered as an h2. */
  title?: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        border: `1px solid ${codeaiVar('gray3')}`,
        borderRadius: codeaiRadius('md', '10px'),
        px: 1.5,
        py: 1.25,
        minWidth: 0,
        breakInside: 'avoid',
      }}
    >
      {title && <PrintHeading level="h2">{title}</PrintHeading>}
      {children}
    </Box>
  );
}

/** A filled block whose text contrast-switches like a Section on `background`. */
export function PrintBand({
  background,
  children,
}: {
  background: BrandColor & CodeaiColor;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        background: codeaiVar(background),
        borderRadius: codeaiRadius('md', '10px'),
        px: 2,
        py: 1.5,
        breakInside: 'avoid',
        ...exactColors,
      }}
    >
      <SectionBackgroundProvider value={background}>
        {children}
      </SectionBackgroundProvider>
    </Box>
  );
}

/** One US Letter page with the edition and "Data as of" in its header. */
export function PrintPage({
  label,
  edition,
  dataAsOf,
  children,
}: {
  label: string;
  /** The state name, or "National". */
  edition: string;
  dataAsOf: string | null;
  children: ReactNode;
}) {
  return (
    <Box
      component="section"
      aria-label={label}
      data-print-page
      className={styles.page}
      sx={exactColors}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${codeaiVar('gray3')}`,
          pb: 0.75,
        }}
      >
        <Paragraph visualAppearance="text-xs" color="gray6" removeMarginBottom>
          {REPORT_TITLE} · <strong>{edition}</strong> · {label}
        </Paragraph>
        <DataAsOf value={dataAsOf} />
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, flex: 1}}>
        {children}
      </Box>
    </Box>
  );
}

/** Small print text. */
export function Small({
  children,
  strong,
  center,
}: {
  children: ReactNode;
  strong?: boolean;
  center?: boolean;
}) {
  return (
    <Paragraph
      visualAppearance="text-xs"
      isStrong={strong}
      removeMarginBottom
      sx={center ? {textAlign: 'center'} : undefined}
    >
      {children}
    </Paragraph>
  );
}

/** A page's title row: heading on the left, a short aside on the right. */
export function PageTitle({
  level = 'h2',
  overline,
  title,
  aside,
}: {
  level?: 'h1' | 'h2';
  overline?: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 2,
      }}
    >
      <Box>
        {overline && (
          <CustomText
            type="overline"
            htmlTag="p"
            fontSize={0.625}
            removeMarginBottom
          >
            {overline}
          </CustomText>
        )}
        <PrintHeading level={level}>{title}</PrintHeading>
      </Box>
      {aside && <Box sx={{textAlign: 'right'}}>{aside}</Box>}
    </Box>
  );
}

export const printTile = {
  background: codeaiVar('purpleLight'),
  borderRadius: codeaiRadius('md', '10px'),
  p: 1.5,
};

// Page-level print rules. Global, so they can't live in the CSS module.
const printGlobals = {
  '@media print': {
    // Hide the site header, footer and anything else beside the report's <main>.
    '*:has(> main [data-sodf-print]) > :not(main)': {
      display: 'none !important',
    },
    'main:has([data-sodf-print]) .section-root': {
      background: 'none !important',
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
      <Box className={styles.report} data-sodf-print>
        <GlobalStyles styles={printGlobals} />
        <Box
          component="nav"
          aria-label="Printable report"
          className={styles.toolbar}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
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
