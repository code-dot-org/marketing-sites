import Box from '@mui/material/Box';
import type {ReactNode} from 'react';

import type {BrandColor} from '@/components/common/colors';

import {CustomText, Paragraph} from '../brandComponents';

export interface StatProps {
  /** A `\n` sets where the label breaks. */
  label: string;
  value: number | null;
  /** Shown as "/{max}" and read as "out of {max}". */
  max?: number;
  unit?: '%';
  digits?: number;
  /** Optional change tag, already formatted (e.g. "+2.1 pts"). */
  delta?: string | null;
  emptyLabel: string;
  /**
   * `medium` (48px) for rows of smaller figures; `print` for the printable
   * report.
   */
  size?: 'default' | 'medium' | 'print';
  /**
   * `centered` follows the Studio "Statistics - centered no subtext"
   * patterns: centred, with an Overline label.
   */
  layout?: 'default' | 'centered';
  /** Statistic color; contrast-switches on dark sections. */
  color?: BrandColor;
  /** Extra content under the label, such as a link. */
  footer?: ReactNode;
}

/**
 * A single figure with its label, built from the Statistic text style and a
 * Paragraph. Shows `emptyLabel` when the value is null.
 */
export default function Stat({
  label,
  value,
  max,
  unit,
  digits = 1,
  delta,
  emptyLabel,
  size = 'default',
  layout = 'default',
  color = 'purplePrimary',
  footer,
}: StatProps) {
  const isPrint = size === 'print';
  const isCentered = layout === 'centered';
  const fontSize = {
    default: undefined,
    medium: undefined,
    print: 1.25,
  }[size];
  const formatted =
    value == null ? emptyLabel : `${value.toFixed(digits)}${unit ?? ''}`;
  const accessibleValue =
    value != null && max != null ? `${formatted} out of ${max}` : formatted;

  return (
    <Box
      role="group"
      aria-label={`${label.replace(/\n/g, ' ')}: ${accessibleValue}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        textAlign: isCentered ? 'center' : undefined,
      }}
    >
      {/* The group's name reads the figure once. */}
      <Box aria-hidden>
        {value == null ? (
          <Paragraph
            visualAppearance={isPrint ? 'text-sm' : 'text-lg'}
            isItalic
            color="gray6"
            removeMarginBottom
          >
            {emptyLabel}
          </Paragraph>
        ) : (
          <CustomText
            type="statistic"
            htmlTag="p"
            color={color}
            textSize={size === 'medium' ? 'lg' : undefined}
            fontSize={fontSize}
            lineHeight={isCentered ? 1 : fontSize ? 1.2 : undefined}
            removeMarginBottom
          >
            {formatted}
            {max != null && (
              <Box component="span" sx={{fontSize: '0.5em'}}>
                /{max}
              </Box>
            )}
          </CustomText>
        )}
        {isCentered ? (
          <Box sx={{mt: 1, whiteSpace: 'pre-line'}}>
            <CustomText type="overline" htmlTag="p" removeMarginBottom>
              {label}
            </CustomText>
          </Box>
        ) : (
          <Paragraph
            visualAppearance={isPrint ? 'text-xs' : 'text-sm'}
            removeMarginBottom
            sx={{whiteSpace: 'pre-line'}}
          >
            {label}
          </Paragraph>
        )}
      </Box>
      {delta && (
        <Paragraph visualAppearance="text-xs" isStrong removeMarginBottom>
          {delta}
        </Paragraph>
      )}
      {footer}
    </Box>
  );
}
