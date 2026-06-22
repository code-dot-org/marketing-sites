# Quickstart: Icon Component

**Feature**: 007-icon-component
**Audience**: Engineer implementing the component, reviewer validating the change.

This document is a short walkthrough of how to bring the Icon component up locally, confirm it renders correctly, and validate the spec acceptance scenarios.

---

## 1. Branch setup

You're already on `dee/component-updates/icon` (branched from a freshly-pulled `sandbox`, per [[feedback_branch_workflow_sandbox_base]]). No further branch work needed.

## 2. Create the Contentful content type (human-applied — do this FIRST)

Before merging any component code, the new `icon` content type MUST exist in Contentful and be confirmed via MCP. See `contracts/contentful-icon-content-type.md` for the exact field schema. Until this is done, the component code is implementable locally but cannot be merged (per spec FR-022 + constitution V).

## 3. Implementation walkthrough

### 3.1. Add the new component directory

```text
apps/marketing/src/components/contentful/icon/
├── Icon.tsx
├── iconContentfulDefinition.ts
├── index.ts
└── __tests__/
    └── Icon.test.tsx
```

### 3.2. `Icon.tsx` — sketch

```tsx
import Box from '@mui/material/Box';
import classNames from 'classnames';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {
  BrandColor,
  cssVarForBrandColor,
  resolvedCssVarForBrandColor,
} from '@/components/common/colors';
import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';

export type IconBackgroundFill = 'none' | 'filled' | 'outline';
export type IconBackgroundShape = 'circle' | 'square';
export type IconBackgroundColor = BrandColor | '#f6f6f6';

export interface IconProps {
  iconName: string;
  color?: BrandColor;
  backgroundFill?: IconBackgroundFill;
  backgroundShape?: IconBackgroundShape;
  backgroundColor?: IconBackgroundColor;
  iconSize?: number;
  className?: string;
}

const SHAPE_RATIO = 1.75;
const OUTLINE_WIDTH = 3;
const SQUARE_RADIUS = '25%';

const resolveBackground = (value: IconBackgroundColor): string =>
  value === '#f6f6f6' ? '#f6f6f6' : cssVarForBrandColor(value as BrandColor);

const Icon: React.FC<IconProps> = ({
  iconName,
  color = 'purplePrimary',
  backgroundFill = 'none',
  backgroundShape = 'circle',
  backgroundColor = '#f6f6f6',
  iconSize = 32,
  className,
}) => {
  const enclosingBackground = useSectionBackground();
  // Contrast switch fires only when the icon sits "naked" on the Section
  // background. When the icon has its own fill or outline, the author's color
  // passes through unchanged — e.g. purplePrimary icon + light fill inside a
  // purplePrimary Section stays purplePrimary.
  const glyphColor =
    backgroundFill === 'none'
      ? resolvedCssVarForBrandColor(color, enclosingBackground)
      : cssVarForBrandColor(color);
  const iconFamily = fontAwesomeV6BrandIconsMap.has(iconName)
    ? 'brands'
    : undefined;

  const glyph = (
    <FontAwesomeV6Icon
      iconName={iconName}
      iconStyle="solid"
      iconFamily={iconFamily}
      style={{fontSize: `${iconSize}px`, color: glyphColor}}
    />
  );

  if (backgroundFill === 'none') {
    return <span className={className}>{glyph}</span>;
  }

  const outerSize = iconSize * SHAPE_RATIO;
  const bg = resolveBackground(backgroundColor);
  const borderRadius = backgroundShape === 'circle' ? '50%' : SQUARE_RADIUS;

  return (
    <Box
      className={classNames(className)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${outerSize}px`,
        height: `${outerSize}px`,
        borderRadius,
        backgroundColor: backgroundFill === 'filled' ? bg : 'transparent',
        border:
          backgroundFill === 'outline'
            ? `${OUTLINE_WIDTH}px solid ${bg}`
            : 'none',
      }}
    >
      {glyph}
    </Box>
  );
};

export default Icon;
```

### 3.3. `iconContentfulDefinition.ts` — sketch

```ts
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {brandColorOptionsWithDefault} from '@/components/common/colors';

const ICON_BRAND_OPTIONS = brandColorOptionsWithDefault('purplePrimary');

const ICON_BACKGROUND_OPTIONS = [
  {value: '#f6f6f6', displayName: 'Light Grey (default)'},
  // No (default) annotation on brand options — Light Grey is the default.
  ...ICON_BRAND_OPTIONS.map(opt => ({
    ...opt,
    displayName: opt.displayName.replace(' (default)', ''),
  })),
];

export const IconContentfulComponentDefinition: ComponentDefinition = {
  id: 'icon',
  name: 'Icon',
  category: '04: Decoration', // confirm against Studio category list
  builtInStyles: [],
  thumbnailUrl: 'TODO — add after design provides',
  tooltip: {
    description: 'A single Font Awesome icon with optional background shape.',
    imageUrl: 'TODO',
  },
  variables: {
    iconName: {
      displayName: 'Icon name',
      type: 'Text',
      group: 'content',
      description: 'Font Awesome icon name',
      defaultValue: 'lightbulb',
      validations: {required: true},
    },
    iconSize: {
      displayName: 'Icon size (px)',
      type: 'Number',
      group: 'style',
      defaultValue: 32,
    },
    color: {
      displayName: 'Color',
      type: 'Text',
      group: 'style',
      defaultValue: 'purplePrimary',
      validations: {in: ICON_BRAND_OPTIONS},
    },
    backgroundFill: {
      displayName: 'Background fill',
      type: 'Text',
      group: 'style',
      defaultValue: 'none',
      validations: {
        in: [
          {value: 'none', displayName: 'None (default)'},
          {value: 'filled', displayName: 'Filled'},
          {value: 'outline', displayName: 'Outline'},
        ],
      },
    },
    backgroundShape: {
      displayName: 'Background shape',
      type: 'Text',
      group: 'style',
      defaultValue: 'circle',
      validations: {
        in: [
          {value: 'circle', displayName: 'Circle (default)'},
          {value: 'square', displayName: 'Square (rounded)'},
        ],
      },
    },
    backgroundColor: {
      displayName: 'Background color',
      type: 'Text',
      group: 'style',
      defaultValue: '#f6f6f6',
      validations: {in: ICON_BACKGROUND_OPTIONS},
    },
  },
};
```

### 3.4. Register on code.org only

Add to `apps/marketing/src/contentful/registration/code.org/index.ts` next to the existing Icon Highlight entry:

```ts
import Icon, {IconContentfulComponentDefinition} from '@/components/contentful/icon';
// ...
{component: Icon, definition: IconContentfulComponentDefinition},
```

Do NOT add anything to `apps/marketing/src/contentful/registration/csforall/`.

### 3.5. Storybook story

Create `apps/marketing-storybook/stories/Icon.story.tsx` with the eight configurations listed in spec FR-020.

### 3.6. Unit tests

Create `apps/marketing/src/components/contentful/icon/__tests__/Icon.test.tsx` covering the cases in spec FR-021.

## 4. Run locally

```sh
yarn dev
# code.org tenant — Icon visible in Studio under category '04: Decoration'
# http://code.org.marketing-sites.localhost:3001/
```

```sh
yarn storybook
# http://localhost:6006 — open the Icon story
```

```sh
# Unit tests
yarn test --filter @code-dot-org/marketing
```

```sh
# Lint + typecheck
yarn lint
yarn typecheck
```

```sh
# Run prettier before commit (per [[feedback_run_prettier_before_commit]])
yarn prettier
```

## 5. Validate acceptance scenarios

Walk through each scenario in `spec.md` "User Stories" against the running Storybook and a Contentful preview:

- US1 #1–#5: bare icon at defaults; brand-family icon detection; color dropdown; iconSize; Icon Highlight unchanged.
- US2 #1–#5: filled circle default; filled square; non-default brand bg; backgroundFill=none has no shape; `#f6f6f6` not on any other component's picker.
- US3 #1–#4: outline circle; outline square; outline default color; glyph color independent of outline color.

## 6. Visual baseline

storybook-eyes will run on the new story. Visual diffs will fail with "no baseline" — accept the new baselines manually in the Applitools dashboard (per [[project_storybook_eyes_baseline_gate]]). Not a code fix.

## 7. Open PR

After the Contentful content type has been confirmed via MCP and all acceptance scenarios pass locally, open a PR.

- PR title: keep short and human-authored (no Claude attribution — `[[feedback_no_claude_attribution]]`).
- PR body: summary bullets only; omit Test plan section (`[[feedback_no_test_plan_in_pr]]`).
- Wait for explicit user approval before pushing or opening (`[[feedback_no_push_without_approval]]`).
