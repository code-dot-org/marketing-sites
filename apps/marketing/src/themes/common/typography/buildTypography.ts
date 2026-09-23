// Pure builder: turns a brand's typography tokens into the MUI `typography`
// options object that createTheme consumes. Emits per-breakpoint media
// queries baked into each variant when the role token defines a `steps`
// table.
//
// Throws at construction time if any of three invariants fail:
//   - floor (no heading <1rem at any breakpoint)
//   - hierarchy (H1 ≥ H2 ≥ ... ≥ H6 ≥ body2 at every breakpoint)
//   - scale completeness (every cell of every track is defined)

import type {Breakpoints} from '@mui/material/styles';
import {createTheme} from '@mui/material/styles';

import type {
  BrandTypographyTokens,
  Breakpoint,
  RoleToken,
  ScaleCell,
  SizeToken,
} from './types';

const SIZE_TOKENS: readonly SizeToken[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
];

const HEADING_ROLES = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

// A role token's `steps` map keys identify VIEWPORTS, not breakpoint cutoffs.
// `steps.md` means "value at the md (desktop) viewport"; that value is the
// default (no media query). For smaller viewports we emit `breakpoints.down()`
// using the NEXT-LARGER breakpoint name so the query covers the named
// viewport and everything below it:
//   steps.sm  →  breakpoints.down('md')  → max-width 899px (tablet + mobile)
//   steps.xs  →  breakpoints.down('sm')  → max-width 599px (mobile only)
// The smaller (more specific) query is emitted last so it wins on overlap.
const VIEWPORT_QUERY_BP: Partial<Record<Breakpoint, Breakpoint>> = {
  sm: 'md',
  xs: 'sm',
};
// Order matters — bigger viewport first so the smaller one's media query
// follows it in the serialized output and wins via source order on overlap.
const STEP_VIEWPORTS: readonly Breakpoint[] = ['sm', 'xs'];

const remToNumber = (rem: string): number => {
  const m = /^(-?\d+(?:\.\d+)?)rem$/.exec(rem.trim());
  if (!m) {
    throw new Error(
      `buildTypography: invalid rem literal "${rem}". Expected e.g. "1.5rem".`,
    );
  }
  return Number(m[1]);
};

export interface BuildTypographyOptions {
  defaultFontFamily?: string;
}

export const buildTypography = (
  tokens: BrandTypographyTokens,
  opts: BuildTypographyOptions = {},
) => {
  const cellFor = (role: RoleToken, size: SizeToken): ScaleCell =>
    tokens.scales[role.track][size];

  const headingSizeAtBreakpoint = (role: RoleToken, bp: Breakpoint): string => {
    const sizeAtBp = (role.steps && role.steps[bp]) ?? role.size;
    return cellFor(role, sizeAtBp).fontSize;
  };

  const assertScaleCompleteness = () => {
    for (const size of SIZE_TOKENS) {
      if (!tokens.scales.display[size]) {
        throw new Error(
          `buildTypography: SCALE_DISPLAY is missing cell "${size}".`,
        );
      }
      if (!tokens.scales.text[size]) {
        throw new Error(
          `buildTypography: SCALE_TEXT is missing cell "${size}".`,
        );
      }
    }
  };

  const assertFloor = () => {
    for (const name of HEADING_ROLES) {
      const role = tokens.roles[name];
      // Default (largest) cell:
      const defaultSize = remToNumber(cellFor(role, role.size).fontSize);
      if (defaultSize < 1) {
        throw new Error(
          `buildTypography: heading "${name}" default font-size ${defaultSize}rem is below the 1rem floor.`,
        );
      }
      // Each step:
      if (role.steps) {
        for (const bp of Object.keys(role.steps) as Breakpoint[]) {
          const size = role.steps[bp];
          if (!size) continue;
          const fontSizeRem = remToNumber(cellFor(role, size).fontSize);
          if (fontSizeRem < 1) {
            throw new Error(
              `buildTypography: heading "${name}" step ${bp}="${size}" resolves to ${fontSizeRem}rem, below the 1rem floor.`,
            );
          }
        }
      }
    }
  };

  const assertHierarchy = () => {
    // Check at the default (md+) breakpoint and at each step breakpoint.
    const breakpointsToCheck: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs'];
    for (const bp of breakpointsToCheck) {
      const sizes = HEADING_ROLES.map(name =>
        remToNumber(headingSizeAtBreakpoint(tokens.roles[name], bp)),
      );
      for (let i = 0; i < sizes.length - 1; i++) {
        if (sizes[i] < sizes[i + 1]) {
          throw new Error(
            `buildTypography: hierarchy violated at breakpoint "${bp}" — h${i + 1} (${sizes[i]}rem) < h${i + 2} (${sizes[i + 1]}rem).`,
          );
        }
      }
    }
  };

  const variantFromRole = (role: RoleToken, breakpoints: Breakpoints) => {
    const baseCell = cellFor(role, role.size);
    const out: Record<string, unknown> = {
      fontFamily: tokens.fontStacks[role.track],
      fontWeight: tokens.weights[role.weight],
      fontSize: baseCell.fontSize,
      lineHeight: baseCell.lineHeight,
    };
    if (baseCell.letterSpacing) {
      out.letterSpacing = baseCell.letterSpacing;
    }

    if (role.steps) {
      for (const viewport of STEP_VIEWPORTS) {
        const stepSize = role.steps[viewport];
        if (!stepSize || stepSize === role.size) continue;
        const queryBp = VIEWPORT_QUERY_BP[viewport];
        if (!queryBp) continue;
        const stepCell = cellFor(role, stepSize);
        const mq = breakpoints.down(queryBp);
        out[mq] = {
          fontSize: stepCell.fontSize,
          lineHeight: stepCell.lineHeight,
          ...(stepCell.letterSpacing
            ? {letterSpacing: stepCell.letterSpacing}
            : {}),
        };
      }
    }

    return out;
  };

  assertScaleCompleteness();
  assertFloor();
  assertHierarchy();

  // We need MUI breakpoints to produce the media-query keys. createTheme()
  // with no arguments gives us the default breakpoints (xs=0, sm=600,
  // md=900, lg=1200, xl=1536) which matches what this repo uses today.
  const {breakpoints} = createTheme();
  const {roles} = tokens;

  return {
    fontFamily: opts.defaultFontFamily ?? tokens.fontStacks.text,
    h1: variantFromRole(roles.h1, breakpoints),
    h2: variantFromRole(roles.h2, breakpoints),
    h3: variantFromRole(roles.h3, breakpoints),
    h4: variantFromRole(roles.h4, breakpoints),
    h5: variantFromRole(roles.h5, breakpoints),
    h6: variantFromRole(roles.h6, breakpoints),
    body1: variantFromRole(roles.body1, breakpoints),
    body2: variantFromRole(roles.body2, breakpoints),
    body3: variantFromRole(roles.body3, breakpoints),
    body4: variantFromRole(roles.body4, breakpoints),
    overline: variantFromRole(roles.overline, breakpoints),
    caption: variantFromRole(roles.caption, breakpoints),
  };
};
