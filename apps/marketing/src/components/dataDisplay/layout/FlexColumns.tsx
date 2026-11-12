import Box from '@mui/material/Box';
import type {ElementType, ReactNode} from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg';
type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

const BREAKPOINTS: Breakpoint[] = ['xs', 'sm', 'md', 'lg'];

/** The theme's spacing unit, in px. */
const SPACING = 8;

/** Per-breakpoint values, each carried up to the next breakpoint that sets one. */
function resolve<T>(value: Responsive<T>): Partial<Record<Breakpoint, T>> {
  if (typeof value !== 'object' || value === null) {
    return Object.fromEntries(BREAKPOINTS.map(bp => [bp, value]));
  }
  const out: Partial<Record<Breakpoint, T>> = {};
  let last: T | undefined;
  for (const bp of BREAKPOINTS) {
    last = (value as Partial<Record<Breakpoint, T>>)[bp] ?? last;
    if (last !== undefined) {
      out[bp] = last;
    }
  }
  return out;
}

export interface FlexColumnsProps {
  /** Items per row by breakpoint; 1 stacks them. */
  columns: Responsive<number>;
  /**
   * Relative widths, e.g. `[2, 1]`, applied while a row holds exactly
   * that many items. Otherwise items share the row equally.
   */
  weights?: number[];
  /** In spacing units; defaults to 2rem. */
  columnGap?: Responsive<number>;
  /** In spacing units; defaults to the narrowest column gap. */
  rowGap?: number;
  alignItems?: 'flex-start' | 'center' | 'stretch';
  /** Items per row when printing; defaults to the widest setting. */
  printColumns?: number;
  component?: ElementType;
  'aria-label'?: string;
  children: ReactNode;
}

/**
 * Columns as a wrapping flexbox row, the way a Studio Container lays out
 * its children. Each direct child gets a column's width.
 */
export default function FlexColumns({
  columns,
  weights,
  columnGap = 4,
  rowGap,
  alignItems = 'stretch',
  printColumns,
  component = 'div',
  'aria-label': ariaLabel,
  children,
}: FlexColumnsProps) {
  const counts = resolve(columns);
  const gaps = resolve(columnGap);
  const used = BREAKPOINTS.filter(bp => counts[bp] !== undefined);
  const widest = counts[used[used.length - 1]] ?? 1;
  const printGap = gaps.lg ?? gaps.md ?? gaps.sm ?? gaps.xs ?? 0;

  // Plain objects, not an sx function: server components render this.
  const width = (count: number, gap: number, item: number) => {
    const free = `(100% - ${gap * SPACING * (count - 1)}px)`;
    if (weights && weights.length === count) {
      const total = weights.reduce((sum, w) => sum + w, 0);
      return `calc(${free} * ${weights[item] / total})`;
    }
    return `calc(${free} / ${count})`;
  };
  const responsiveWidth = (item: number) =>
    Object.fromEntries(
      used.map(bp => [bp, width(counts[bp]!, gaps[bp] ?? 0, item)]),
    );
  const itemRules = (item: number) => ({
    width: responsiveWidth(item),
    '@media print': {width: width(printColumns ?? widest, printGap, item)},
  });

  return (
    <Box
      component={component}
      aria-label={ariaLabel}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems,
        columnGap: Object.fromEntries(used.map(bp => [bp, gaps[bp] ?? 0])),
        rowGap: rowGap ?? gaps.xs ?? 0,
        listStyle: 'none',
        m: 0,
        p: 0,
        '@media print': {columnGap: printGap},
        '& > *': {
          flex: '0 0 auto',
          minWidth: 0,
          boxSizing: 'border-box',
          ...(weights ? {} : itemRules(0)),
        },
        ...(weights
          ? Object.fromEntries(
              weights.map((_, i) => [`& > :nth-child(${i + 1})`, itemRules(i)]),
            )
          : {}),
      }}
    >
      {children}
    </Box>
  );
}

/**
 * The fixed-count form as plain `sx`, for layouts that never stack (the
 * printable pages). `gap` is in spacing units of 8px.
 */
export const flexColumnsSx = (count: number, gap: number) =>
  ({
    display: 'flex',
    flexWrap: 'wrap',
    gap,
    '& > *': {
      width: `calc((100% - ${gap * SPACING * (count - 1)}px) / ${count})`,
      minWidth: 0,
      boxSizing: 'border-box',
    },
  }) as const;
