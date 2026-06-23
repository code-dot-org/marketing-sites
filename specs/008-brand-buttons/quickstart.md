# Quickstart: Brand Buttons & Brand Text Link

**Feature**: 008-brand-buttons
**Audience**: Engineer implementing the feature, reviewer validating the change.

Short walkthrough for bringing both primitives up locally, confirming the new visuals render correctly, and validating spec acceptance scenarios. Assumes familiarity with the repo, Contentful Studio, and the Storybook companions.

---

## 0. Prerequisites

- You are on branch `008-brand-buttons`.
- `specs/008-brand-buttons/figma-tokens.md` is the authoritative per-cell color and per-size grid — refer to it constantly for SCSS rule values.
- **No Contentful access required for this feature.** All "schema" updates are code edits to ComponentDefinition `variables` objects. Existing Contentful content types are read-only (and the `link` content type is not modified at all).

---

## 1. No Contentful Studio work required

Per the 2026-06-22 clarification:

- There is **no `button` content type in Contentful**. The Button is a Contentful Experiences component whose options are hard-coded in `ButtonLegacyContentfulComponentDefinition.variables` (a code-side artifact). The "schema" edit happens in step 3 of this quickstart as a normal code change.
- The Text Link rebrand is also entirely code-side (per-tenant ComponentDefinition factories in `LinkContentfulDefinition.ts`). The `link` content type (used by authors to create reusable Link entries) is **not touched**.
- No Studio steps. No `ctf_get_content_type` MCP re-read step.
- Studio editors see the new Design-tab options on any Experience containing a Button or Text Link as soon as the code change deploys.

---

## 2. Update the shared button package

### 2.1. Types

`packages/component-library/src/button/types.ts`:

```ts
export type ButtonType = 'primary' | 'secondary' | 'tertiary';
export type ButtonColor = 'purple' | 'black' | 'white' | 'destructive';
export type ButtonSize = 's' | 'm' | 'l' | 'xl';
```

### 2.2. `Button.tsx` `buttonColors` update

```ts
export const buttonColors: {[key in ButtonColor]: ButtonColor} = {
  purple: 'purple',
  black: 'black',
  white: 'white',
  destructive: 'destructive',
};
```

### 2.3. `GenericButton.tsx` — `checkButtonPropsForErrors` trim + size swap

- Remove three branches (gray-primary throw, gray-tertiary-non-icon throw, secondary-purple deprecation warning).
- Replace `import {ComponentSizeXSToL} from '@/common/types';` with the new local `ButtonSize` from `./types`.
- Replace `size?: ComponentSizeXSToL;` with `size?: ButtonSize;`.

### 2.4. Add the corner-radius SCSS variable

`packages/component-library-styles/variables.scss`:

```scss
// Button-specific border radius — see specs/008-brand-buttons/research.md R5
$button-border-radius: 0.5rem; // 8px
```

### 2.5. Add the Figma-final color CSS custom properties

Create `packages/component-library-styles/buttonColors.scss`:

```scss
/* Brand Buttons + Brand Text Link color tokens — sourced from
   specs/008-brand-buttons/figma-tokens.md (Figma file Aw6YXqpx6QFlNMXqCKk60e
   node 7:3976). These are FINAL per the user; do not alias to primitiveColors.scss. */
:root {
  --button-color-purple-primary: #4c42cf;
  --button-color-purple-hover: #382ea5;
  --button-color-purple-dark: #1f1976;
  --button-color-purple-light: #e4e2f8;
  --button-color-purple-tint: #f8f6ff;
  --button-color-black: #000000;
  --button-color-white: #ffffff;
  --button-color-white-alpha-20: rgba(255, 255, 255, 0.2);
  --button-color-disabled-dark: #afb8c2;
  --button-color-link-disabled: #d1d4d8;
  --button-color-disabled-light: #e4e6e9;
  --button-color-disabled-bg: #f2f2f2;
  --button-focus-ring: #0a84ff;
}
```

Wire it into the global SCSS entry point alongside `primitiveColors.scss` (find the import in `apps/marketing/src/app/layout.tsx` or the equivalent).

### 2.6. Rewrite `packages/component-library/src/button/genericButton.module.scss`

- Replace `border-radius: 0.25rem;` with `border-radius: variables.$button-border-radius;` (add `@use '@code-dot-org/component-library-styles/variables.scss' as variables;` at the top).
- Remove both `&.button-gray` blocks.
- Add a top-of-file SCSS comment delimiting the `&.button-destructive` rules as "Non-Brand legacy treatment — see specs/008-brand-buttons/research.md R3".
- Add rule blocks for the 9 Type × Color cells × 5 states using the Figma-final tokens. Example:

  ```scss
  .button-primary.button-purple {
    background-color: var(--button-color-purple-primary);
    border: 0;
    color: var(--button-color-white);
    &:hover,
    &.button-withForcedHover {
      background-color: var(--button-color-purple-hover);
      color: var(--button-color-purple-light);
    }
    &:focus-visible {
      outline: 2px solid var(--button-focus-ring);
      outline-offset: 4px;
      border-radius: 10px;
    }
    &:disabled,
    &[aria-disabled='true'] {
      background-color: var(--button-color-disabled-bg);
      border: 1px solid var(--button-color-disabled-bg);
      color: var(--button-color-disabled-dark);
    }
    &.is-loading {
      // Loading = Hover visual + spinner for purple hierarchies
      background-color: var(--button-color-purple-hover);
      color: var(--button-color-white);
    }
  }
  ```

  Repeat for the other 8 Type × Color cells. Full grid in `figma-tokens.md`.

- Update per-size rule blocks `.button-s`, `.button-m`, `.button-l`, `.button-xl` per the figma-tokens "Per-size dimensions" table. Note: `text-transform: uppercase` applies to `.button-m`, `.button-l`, `.button-xl` but NOT to `.button-s`, and the loading state drops uppercase regardless of size:

  ```scss
  .button {
    text-transform: uppercase;
    &.button-s,
    &.is-loading {
      text-transform: none;
    }
  }
  ```

### 2.7. Stories

Update `packages/component-library/src/button/stories/{Button,LinkButton,GenericButton}.story.tsx`:

- Remove `xs` story rows.
- Add `xl` story rows.
- Update size control to `['s', 'm', 'l', 'xl']`; color control to `['purple', 'black', 'white', 'destructive']`.
- Add 5-state story (Default / Hover / Focus / Disabled / Loading) on one representative cell.
- Add `useAsLink=true` external-link story per FR-020(g).

### 2.8. Tests

Update `packages/component-library/src/button/__tests__/`:

- Remove `color="gray" type="primary"` throw test.
- Remove `color="purple" type="secondary"` warning test.
- Add tests per FR-021 (4 sizes, 3 types, 3 brand colors, 5 states, icon-only happy + error, left/right icon, useAsLink semantics).

### 2.9. Video.tsx migration

`packages/component-library/src/video/Video.tsx:168, 174`:

```diff
- color="gray"
+ color="black"
...
- size="xs"
+ size="s"
```

---

## 3. Update the code.org Contentful Button wrapper

`apps/marketing/src/components/contentful/corporateSite/buttonLegacy/ButtonLegacy.tsx` — see `contracts/contentful-button-content-type-update.md` for the full sketch. Key additions:

- Accept new `size`, `iconRightName`, `isIconOnly` props.
- Brand-family detect both `iconLeftName` and `iconRightName`.
- External-link icon is a **fallback only** when `iconRightName` is empty (R7 / FR-019).
- Icon-only path: render `LinkButton` with `isIconOnly` + `icon={authorIconLeft}`; suppress text.

`apps/marketing/src/components/contentful/corporateSite/buttonLegacy/ButtonLegacyContentfulDefinition.ts` — add `size`, `iconRightName`, `isIconOnly` variable entries; expand `type` enum.

---

## 4. Refactor the shared Text Link (the riskier piece — read R12 first)

### 4.1. Refactor `Link.tsx` to be theme-aware

`apps/marketing/src/components/contentful/link/Link.tsx`:

```tsx
import MuiLink from '@mui/material/Link';
import classNames from 'classnames';
import OpenInNew from '@mui/icons-material/OpenInNew';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {
  BrandColor,
  EnclosingBackground,
  resolveTextColorForBackground,
} from '@/components/common/colors';
import {ComponentSize} from '@/components/common/types';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';

type Hierarchy = 'color' | 'black' | 'white';
type ResolvedSize = 's' | 'm' | 'l' | 'xs'; // 'xs' kept for csforall

const resolveHierarchy = (color: BrandColor): Hierarchy => {
  switch (color) {
    case 'primary':
    case 'purplePrimary':
      return 'color';
    case 'default':
      return 'black';
    case 'white':
      return 'white';
    default:
      return 'color';
  }
};

const resolveBrandSize = (size: ComponentSize): ResolvedSize =>
  size === 'xs' ? 's' : size;

const Link: React.FunctionComponent<LinkProps> = ({
  children,
  href,
  color = 'primary',
  size = 'm',
  isLinkExternal,
  isStrong = false,
  icon,
  iconPosition = 'right',
  isPending = false,
  ariaLabel,
  removeMarginBottom,
  className,
}) => {
  const hierarchy = resolveHierarchy(color);
  const enclosingBackground = useSectionBackground();

  // Per FR-032: switch ON for 'color' and 'black'; OFF for 'white'.
  const resolvedHierarchy: Hierarchy =
    hierarchy === 'white'
      ? 'white'
      : applyContrastSwitch(hierarchy, enclosingBackground);

  const resolvedSize = resolveBrandSize(size);
  const userIcon =
    !isLinkExternal && icon ? (
      <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
    ) : null;

  return (
    <MuiLink
      data-hierarchy={resolvedHierarchy}
      data-loading={isPending ? 'true' : undefined}
      className={classNames(`link--size-${resolvedSize}`, className)}
      href={href}
      target={isLinkExternal ? '_blank' : undefined}
      rel={isLinkExternal ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
      sx={{marginBottom: removeMarginBottom ? 0 : undefined}}
    >
      {userIcon && iconPosition === 'left' && userIcon}
      <span>{children}</span>
      {userIcon && iconPosition === 'right' && userIcon}
      {isLinkExternal && <OpenInNew fontSize="inherit" />}
      {isPending && (
        <FontAwesomeV6Icon
          iconName="spinner"
          iconStyle="solid"
          animationType="spin"
        />
      )}
    </MuiLink>
  );
};
```

`applyContrastSwitch` is a small helper that maps `(hierarchy, enclosingBackground)` → a possibly-flipped Hierarchy (e.g. `color` on a dark Section → `white` so the theme override renders white). Equivalent to today's `resolveLinkColor` logic but yields a Hierarchy instead of a CSS variable.

### 4.2. Refactor `LinkContentfulDefinition.ts` into two factories

Per `contracts/contentful-link-content-type-update.md`. Export `BrandLinkContentfulComponentDefinition` (code.org, 3 Hierarchies + 3 sizes) and `LegacyLinkContentfulComponentDefinition` (csforall, 22 colors + 4 sizes).

### 4.3. Update the tenant registrations

Edit `apps/marketing/src/contentful/registration/code.org/index.ts` to import `BrandLinkContentfulComponentDefinition` instead of `LinkContentfulComponentDefinition`.
Edit `apps/marketing/src/contentful/registration/csforall/index.ts` to import `LegacyLinkContentfulComponentDefinition`.

### 4.4. Create the tenant theme override files

`apps/marketing/src/themes/code.org/styleOverrides/link.ts` — Brand Link rules per `contracts/text-link-component-props.md` (the `LINK_OVERRIDES` shape with the data-hierarchy / data-loading / per-size selectors).
`apps/marketing/src/themes/csforall/styleOverrides/link.ts` — legacy Link styling extracted from today's hardcoded `sx`.

Wire both into the existing tenant theme aggregators.

### 4.5. Update Text Link tests

`apps/marketing/src/components/contentful/link/__tests__/`:

- `resolveHierarchy` mapping table tests (every legacy color → Hierarchy).
- `resolveBrandSize` mapping: `xs` → `s`; others passthrough.
- Contrast switch ON for `color`/`black`; OFF for `white`.
- `isStrong` ignored on code.org rendering (assert that data-hierarchy is set regardless of isStrong).
- `isPending` renders spinner + sets `data-loading`.

### 4.6. Update Text Link Storybook

`apps/marketing-storybook/stories/Link.story.tsx`:

- 3 Hierarchies × 3 sizes × 5 states sweep.
- Tenant-theme switcher story (visualize code.org Brand vs csforall legacy side-by-side).
- Asymmetric Hover demo (color vs black/white).
- External-link story.
- Contrast-switch demo (links inside dark Sections).

---

## 5. Local verification

```bash
yarn prettier --write packages/component-library/src/button packages/component-library-styles \
  apps/marketing/src/components/contentful/corporateSite/buttonLegacy \
  apps/marketing/src/components/contentful/link apps/marketing/src/themes
yarn typecheck
yarn lint
yarn workspace @code-dot-org/component-library test
yarn workspace marketing test

# Bring up the design-system storybook (Button)
yarn workspace design-system-storybook storybook
# Step through Button stories, verify 4 sizes × 9 cells × 5 states match Figma.

# Bring up the marketing storybook (Text Link)
yarn workspace marketing-storybook storybook
# Step through Text Link stories, verify 3 hierarchies × 3 sizes × 5 states match Figma.
# Toggle the tenant switcher; verify csforall Text Link visuals are BYTE-IDENTICAL to baseline.

# Bring up the marketing app
yarn workspace marketing dev
# http://code.org.marketing-sites.localhost:3001 — walk pages with Button and Text Link entries.
# http://csforall.marketing-sites.localhost:3001 — walk csforall pages; verify NO visual change to Text Links.
```

---

## 6. Visual regression (storybook-eyes)

After all stories build cleanly, push the branch and open a PR. The storybook-eyes CI step will diff every Button-adjacent AND Text-Link-adjacent story.

- Open the Applitools dashboard from the CI output.
- Visually review every diff.
- **Accept** the new baselines for code.org Button and code.org Text Link stories.
- **REJECT** any diffs on csforall Text Link stories — if any appear, the csforall theme override is not perfectly mirroring today's behavior; investigate and fix before re-running.
- Re-run CI; gate flips to green once new baselines are accepted.

---

## 7. PR checklist (`[[feedback_no_test_plan_in_pr]]`, `[[feedback_no_claude_attribution]]`)

PR body is summary bullets only — no test-plan section. Mention:

- **No Contentful schema changes.** Button + Text Link "schema" updates are code-side ComponentDefinition variable edits; the `link` Contentful content type is read-only for this feature.
- `gray` Button color fully removed; Video.tsx migrated.
- `destructive` Button color preserved as segregated legacy.
- Text Link refactored to be theme-aware; csforall visuals byte-identical.
- New SCSS file `packages/component-library-styles/buttonColors.scss` lands the 13 Figma-final color tokens.
- Storybook visual baselines re-accepted (code.org); csforall stories must show no diff.

Do NOT commit until prettier passes (`[[feedback_run_prettier_before_commit]]`).
Do NOT push or open the PR without explicit OK (`[[feedback_no_push_without_approval]]`).

---

## 8. Validation against the spec acceptance scenarios

| Spec scenario  | How to validate                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US1 / 1–6      | Step through Brand Button story in design-system Storybook; compare each cell to Figma.                                                                                |
| US2 / 1–5      | Walk code.org pages with existing Button entries; zero edits needed.                                                                                                   |
| US3 / 1–6      | In Contentful Studio (preview against local dev server), edit a Button to use `tertiary`, `xl`, `iconRightName=arrow-right`, `isIconOnly=true`; confirm renders.       |
| US4 / 1–4      | Run typecheck + tests; open both Storybooks; confirm `gray` and `xs` greps return zero matches.                                                                        |
| US5 / 1–7      | Step through Text Link story in marketing Storybook; verify per-Hierarchy / per-size / per-state cells match Figma; verify asymmetric Hover (color vs black/white).    |
| US6 / 1–6      | Walk code.org pages with existing Text Link entries; zero edits needed; verify contrast-switch behavior (`color` and `black` flip on dark Sections; `white` does not). |
| SC-001..SC-016 | See spec.md Success Criteria for per-criterion validation method.                                                                                                      |

---

## 9. Common pitfalls

- **CSforAll Text Link regression**: If any csforall page's Text Link visually changes, the csforall theme override is not encoding today's behavior accurately. The contract requires byte-identical csforall visuals. Don't merge until storybook-eyes csforall diffs are zero.
- **CSS variables imported but unused**: `buttonColors.scss` MUST be imported into the global SCSS entry point — else the `var(--button-…)` references in `genericButton.module.scss` and `themes/code.org/styleOverrides/link.ts` will silently render nothing (or fall back to whatever fallback you provide). No fallbacks per FR-038.
- ~~**Forgetting the Contentful `button` schema delta**~~: not applicable — no Contentful Studio step exists. The new options land via the code-side `variables` edit in T020.
- **Tests left in for `gray` / `xs` / Secondary-Purple warning**: Old throw/warn behavior is gone. Tests asserting those behaviors MUST be removed.
- **`xs` size on csforall Text Link**: The csforall `LegacyLinkContentfulComponentDefinition` MUST keep `xs` in its `size` enum (existing csforall entries depend on it).
- **`isStrong` removed accidentally**: Don't remove the `isStrong` prop or Contentful field; csforall still uses it. Code.org renders it as a no-op (Brand Links always Bold 700).
- **Hover behavior wrong**: It's NOT a uniform "underline on hover" rule. `color` Hover changes text color (no underline); `black` and `white` Hover keep text color and add underline. Tests + Storybook must exercise this asymmetry.
