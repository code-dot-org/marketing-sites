import Box from '@mui/material/Box';
import type {ReactNode} from 'react';

import type {BrandColor} from '@/components/common/colors';
import Badge from '@/components/contentful/badge/Badge';
import {
  Button,
  Heading,
  Paragraph,
  Section,
} from '@/components/dataDisplay/brandComponents';
import {codeaiVar} from '@/components/dataDisplay/codeaiColors';
import {textCell} from '@/components/dataDisplay/typeScale';
import {codeaiRadius} from '@/themes/code.org/constants/radius';

import {REPORT_TITLE} from '../constants';

export interface ReportAction {
  href: string;
  label: string;
}

/** The page hero: h1, subtitle and actions on Purple Light. */
export function ReportHero({
  title,
  titleColor = 'purplePrimary',
  accentColor,
  subtitle,
  subtitleMaxWidth,
  centered = false,
  primaryAction,
  secondaryAction,
}: {
  /** Wrap words in `*…*` with `accentColor` for the two-tone heading. */
  title: string;
  titleColor?: BrandColor;
  /** The `*…*` words' color. */
  accentColor?: BrandColor;
  /** One paragraph, or an array for several. */
  subtitle?: ReactNode | ReactNode[];
  /** In px; an array sets each paragraph's width in turn. */
  subtitleMaxWidth?: number | number[];
  /** Centre the content and every line of text. */
  centered?: boolean;
  primaryAction?: ReportAction;
  secondaryAction?: ReportAction;
}) {
  return (
    <Section background="purpleLight" padding="l">
      <Box sx={centered ? {textAlign: 'center'} : undefined}>
        <Heading
          removeMarginBottom={false}
          visualAppearance="heading-xxl"
          color={titleColor}
          accentColor={accentColor ?? 'none'}
          accentLineBreak="off"
        >
          {title}
        </Heading>
        {subtitle != null &&
          (Array.isArray(subtitle) ? subtitle : [subtitle]).map(
            (paragraph, i, all) => {
              const maxWidth = Array.isArray(subtitleMaxWidth)
                ? subtitleMaxWidth[i]
                : subtitleMaxWidth;
              return (
                <Paragraph
                  key={i}
                  visualAppearance="text-md"
                  removeMarginBottom={i === all.length - 1}
                  sx={{
                    ...(maxWidth && {maxWidth: `${maxWidth}px`}),
                    ...(centered && {marginLeft: 'auto', marginRight: 'auto'}),
                  }}
                >
                  {paragraph}
                </Paragraph>
              );
            },
          )}
        {(primaryAction || secondaryAction) && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: centered ? 'center' : undefined,
              gap: 2,
              mt: 4,
            }}
          >
            {primaryAction && (
              <Button
                color="purple"
                type="primary"
                href={primaryAction.href}
                text={primaryAction.label}
                iconRightName="angle-right"
              />
            )}
            {secondaryAction && (
              <Button
                // The site's usual hero pair: purple, then black.
                color="black"
                type="primary"
                href={secondaryAction.href}
                text={secondaryAction.label}
                iconRightName="angle-right"
              />
            )}
          </Box>
        )}
      </Box>
    </Section>
  );
}

/** A page section with an optional h2 and intro paragraph. */
export function ReportSection({
  id,
  title,
  titleColor,
  intro,
  introSize = 'large',
  background = 'white',
  padding = 'l',
  divider = false,
  centerHeader = false,
  label,
  children,
}: {
  /** In-page anchor. */
  id?: string;
  title?: string;
  titleColor?: BrandColor;
  intro?: ReactNode;
  /** `regular` is the body paragraph style. */
  introSize?: 'large' | 'regular';
  background?: BrandColor;
  padding?: 'l' | 'm';
  /** A bottom rule, for back-to-back sections on the same background. */
  divider?: boolean;
  /** Centre the title and intro. */
  centerHeader?: boolean;
  /** Accessible name when there's no visible title. */
  label?: string;
  children: ReactNode;
}) {
  return (
    <Section
      background={background}
      padding={padding}
      divider={divider ? 'primary' : 'none'}
    >
      <Box
        component="section"
        id={id}
        aria-label={title ? undefined : label}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          scrollMarginTop: '96px',
        }}
      >
        {(title || intro) && (
          <Box sx={centerHeader ? {textAlign: 'center'} : undefined}>
            {title && (
              <Heading
                visualAppearance="heading-xl"
                color={titleColor}
                removeMarginBottom={!intro}
              >
                {title}
              </Heading>
            )}
            {intro && (
              <Paragraph
                visualAppearance={introSize === 'large' ? 'text-lg' : 'text-md'}
                removeMarginBottom
              >
                {intro}
              </Paragraph>
            )}
          </Box>
        )}
        {children}
      </Box>
    </Section>
  );
}

/** A content block inside a section: our medium radius, no shadow. */
export function ReportPanel({
  title,
  background = 'white',
  bordered = false,
  children,
  sx,
}: {
  /** Rendered as an h3. */
  title?: string;
  background?: 'white' | 'gray1';
  /** A 2px Purple Light border, for panels on a matching background. */
  bordered?: boolean;
  children: ReactNode;
  sx?: object;
}) {
  return (
    <Box
      sx={{
        background: codeaiVar(background),
        border: bordered ? `2px solid ${codeaiVar('purpleLight')}` : undefined,
        borderRadius: codeaiRadius('md', '10px'),
        p: {xs: 3, md: 4},
        minWidth: 0,
        breakInside: 'avoid',
        ...sx,
      }}
    >
      {title && <PanelHeading>{title}</PanelHeading>}
      {children}
    </Box>
  );
}

/** An h3 at the panel scale. */
export function PanelHeading({
  children,
  size = 'default',
}: {
  children: string;
  size?: 'default' | 'small' | 'print';
}) {
  return (
    <Heading
      removeMarginBottom={false}
      visualAppearance="heading-lg"
      // Print keeps its own small size to fit the letter pages.
      {...(size === 'print'
        ? {fontSize: 0.9375, lineHeight: 1.3}
        : textCell(size === 'small' ? 'lg' : '2xl'))}
    >
      {children}
    </Heading>
  );
}

/** Plain text with the sheet's line breaks kept. Never HTML. */
export function Narrative({
  text,
  size = 'default',
}: {
  text: string | null;
  size?: 'default' | 'print';
}) {
  if (!text) {
    return null;
  }
  return (
    <Paragraph
      removeMarginBottom={false}
      visualAppearance={size === 'print' ? 'text-xs' : 'text-md'}
      sx={{
        whiteSpace: 'pre-line',
        marginTop: size === 'print' ? '4px' : '16px',
      }}
    >
      {text}
    </Paragraph>
  );
}

export function DataAsOf({value}: {value: string | null}) {
  if (!value) {
    return null;
  }
  return (
    <Badge
      text={`Data as of ${value}`}
      color="purple"
      size="small"
      appearance="light"
    />
  );
}

/** Report name and data date, closed with the strong section rule. */
export function ReportFooter({
  dataAsOf,
  children,
}: {
  dataAsOf: string | null;
  children?: ReactNode;
}) {
  return (
    <Section background="white" padding="m" divider="strong">
      <Box
        component="footer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Paragraph visualAppearance="text-sm" isStrong removeMarginBottom>
          {REPORT_TITLE}
        </Paragraph>
        <DataAsOf value={dataAsOf} />
        {children}
      </Box>
    </Section>
  );
}
