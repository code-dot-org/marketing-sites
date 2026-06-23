# Figma Token Grid: Brand Buttons + Brand Links

**Feature**: 008-brand-buttons
**Source**: Figma file `Aw6YXqpx6QFlNMXqCKk60e` (CodeAI Design System), component set **Brand Buttons** node `7:3976`.
**Extracted**: 2026-06-22 via 64 `mcp__figma__get_design_context` / `get_metadata` calls. Cells marked "—" or "extrapolated" indicate the Figma payload did not contain a direct value; the implementation may derive them from the documented per-state rule (e.g. Loading bg = Hover bg for purple hierarchies; else = Default bg).

The user has stated these tokens are **final**. The SCSS module consumes them as-is — no placeholder fallbacks to the universal brand-color manifest.

---

## Brand Button — Type × Color × State matrix (`md` size, `icon=False`)

| Hierarchy       | State    | bg                                  | border                                                                | text                     | source       |
| --------------- | -------- | ----------------------------------- | --------------------------------------------------------------------- | ------------------------ | ------------ |
| Primary         | Default  | `#4C42CF` (Primary Purple)          | —                                                                     | `#FFFFFF`                | 7:3977       |
| Primary         | Hover    | `#382EA5` (Primary Hover)           | —                                                                     | `#E4E2F8` (Light Purple) | 7:4157       |
| Primary         | Focused  | `#4C42CF` (inner unchanged)         | `2px` `#0A84FF` (Focus Blue) outer ring, 4px gap, outer radius `10px` | `#FFFFFF`                | 7:4091       |
| Primary         | Disabled | `#F2F2F2` (Gray 1)                  | `1px` `#F2F2F2`                                                       | `#AFB8C2` (Gray 4)       | 7:4034       |
| Primary         | Loading  | `#382EA5` (Hover bg)                | —                                                                     | `#FFFFFF`                | 7:4172       |
| Primary Black   | Default  | `#000000`                           | —                                                                     | `#FFFFFF`                | 7:3982       |
| Primary Black   | Hover    | `#1F1976` (Dark Purple)             | —                                                                     | `#E4E2F8`                | 7:4162       |
| Primary Black   | Focused  | inner unchanged                     | Focus Blue ring (same pattern as Primary Focused)                     | inner unchanged          | extrapolated |
| Primary Black   | Disabled | `#F2F2F2`                           | `1px` `#F2F2F2`                                                       | `#AFB8C2`                | 7:4039       |
| Primary Black   | Loading  | `#000000` (Default bg kept)         | —                                                                     | `#FFFFFF`                | 7:4176       |
| Primary White   | Default  | `#FFFFFF`                           | —                                                                     | `#4C42CF`                | 7:3987       |
| Primary White   | Hover    | `#F8F6FF` (Light Primary Hover)     | —                                                                     | `#4C42CF`                | 7:4167       |
| Primary White   | Focused  | inner unchanged                     | Focus Blue ring                                                       | inner unchanged          | extrapolated |
| Primary White   | Disabled | `#F2F2F2`                           | `1px` `#F2F2F2`                                                       | `#AFB8C2`                | 7:4044       |
| Primary White   | Loading  | `#FFFFFF` (Default bg kept)         | —                                                                     | `#4C42CF`                | 7:4180       |
| Secondary       | Default  | `transparent`                       | `2px` `#4C42CF`                                                       | `#4C42CF`                | 7:4019       |
| Secondary       | Hover    | `#F8F6FF`                           | `2px` `#382EA5`                                                       | `#382EA5`                | 7:4232       |
| Secondary       | Focused  | inner unchanged                     | Focus Blue ring (outer); inner `2px` Primary Purple                   | inner unchanged          | extrapolated |
| Secondary       | Disabled | `transparent`                       | `2px` `#AFB8C2`                                                       | `#AFB8C2`                | 7:4076       |
| Secondary       | Loading  | `transparent`                       | `2px` `#382EA5`                                                       | `#382EA5`                | 7:4247       |
| Secondary Black | Default  | `transparent`                       | `2px` `#000000`                                                       | `#000000`                | 7:4024       |
| Secondary Black | Hover    | `#E4E2F8`                           | `2px` `#000000`                                                       | `#000000`                | 7:4237       |
| Secondary Black | Focused  | inner unchanged                     | Focus Blue ring (outer); inner `2px` Black                            | inner unchanged          | extrapolated |
| Secondary Black | Disabled | `transparent`                       | `2px` `#AFB8C2`                                                       | `#AFB8C2`                | 7:4081       |
| Secondary Black | Loading  | `transparent`                       | `2px` `#000000` (Default border kept)                                 | `#000000`                | extrapolated |
| Secondary White | Default  | `transparent`                       | `2px` `#FFFFFF`                                                       | `#FFFFFF`                | 7:4029       |
| Secondary White | Hover    | `rgba(255,255,255,0.2)` (White 20%) | `2px` `#FFFFFF`                                                       | `#FFFFFF`                | 7:4242       |
| Secondary White | Focused  | inner unchanged                     | Focus Blue ring (outer); inner `2px` White                            | inner unchanged          | extrapolated |
| Secondary White | Disabled | `transparent`                       | `2px` `#E4E6E9` (Gray 2)                                              | `#E4E6E9`                | 7:4086       |
| Secondary White | Loading  | `transparent`                       | `2px` `#FFFFFF` (Default border kept)                                 | `#FFFFFF`                | extrapolated |
| Tertiary        | Default  | `transparent`                       | —                                                                     | `#4C42CF`                | 7:4004       |
| Tertiary        | Hover    | `#F8F6FF`                           | —                                                                     | `#382EA5`                | 7:4205       |
| Tertiary        | Focused  | inner unchanged                     | Focus Blue ring (outer)                                               | inner unchanged          | extrapolated |
| Tertiary        | Disabled | `transparent`                       | —                                                                     | `#AFB8C2`                | 7:4061       |
| Tertiary        | Loading  | `transparent`                       | —                                                                     | `#382EA5`                | extrapolated |
| Tertiary Black  | Default  | `transparent`                       | —                                                                     | `#000000`                | 7:4009       |
| Tertiary Black  | Hover    | `#F8F6FF`                           | —                                                                     | `#000000`                | 7:4210       |
| Tertiary Black  | Focused  | inner unchanged                     | Focus Blue ring (outer)                                               | inner unchanged          | extrapolated |
| Tertiary Black  | Disabled | `transparent`                       | —                                                                     | `#AFB8C2`                | 7:4066       |
| Tertiary Black  | Loading  | `transparent`                       | —                                                                     | `#000000`                | extrapolated |
| Tertiary White  | Default  | `transparent`                       | —                                                                     | `#FFFFFF`                | 7:4014       |
| Tertiary White  | Hover    | `rgba(255,255,255,0.2)`             | —                                                                     | `#FFFFFF`                | 7:4215       |
| Tertiary White  | Focused  | inner unchanged                     | Focus Blue ring (outer)                                               | inner unchanged          | extrapolated |
| Tertiary White  | Disabled | `transparent`                       | —                                                                     | `#E4E6E9`                | 7:4071       |
| Tertiary White  | Loading  | `transparent`                       | —                                                                     | `#FFFFFF`                | extrapolated |

### Loading-state rule (implementation shortcut)

For the 3 cells where the Loading bg/border is documented as different from Default, the rule is:

> **Loading visual = Hover visual + spinner + label replaced** for purple-color hierarchies (`Primary`, `Secondary`, `Tertiary`).
> **Loading visual = Default visual + spinner + label replaced** for Black and White hierarchies.

This implies a single CSS class composition: `.button.is-loading` inherits hover styling for purple variants only.

---

## Brand Button — Per-size dimensions (Primary Default, `icon=False`)

| Size | padding (x / y) | font-size | font-weight | line-height | letter-spacing | text-transform                 | icon-size | gap   | corner-radius |
| ---- | --------------- | --------- | ----------- | ----------- | -------------- | ------------------------------ | --------- | ----- | ------------- |
| `s`  | `12px / 8px`    | `14px`    | `700`       | `21.7px`    | `0`            | **none** (Button 14 Space)     | `13px`    | `4px` | `8px`         |
| `m`  | `14px / 10px`   | `14px`    | `700`       | `21.7px`    | `0`            | **uppercase** (Button 14 Caps) | `13px`    | `4px` | `8px`         |
| `l`  | `17px / 14px`   | `16px`    | `700`       | `24px`      | `0`            | **uppercase** (Button 16)      | `20px`    | `6px` | `8px`         |
| `xl` | `20px / 17px`   | `20px`    | `700`       | `28px`      | `-0.2px`       | **uppercase**                  | `20px`    | `6px` | `8px`         |

Notes:

- The text node itself carries an extra `2px` inner horizontal padding; effective horizontal padding from the visible label edge is `padding-x + 2px`.
- **`s` and the Loading state are NOT uppercased.** Other sizes/states are.
- **`xl` has -0.2px letter-spacing** (only size with negative tracking).
- All sizes share `font-family: 'Space Grotesk'`, `font-weight: 700`.

### Icon-only square dimensions (Primary Default)

| Size | square footprint | icon-size | padding (uniform) | corner-radius |
| ---- | ---------------- | --------- | ----------------- | ------------- |
| `s`  | `36×36`          | `20px`    | `8px`             | `8px`         |
| `m`  | `44×44`          | `20px`    | `12px`            | `8px`         |
| `l`  | `52×52`          | `20px`    | `16px`            | `8px`         |
| `xl` | `60×60`          | `20px`    | `20px`            | `8px`         |

**Icon glyph stays at `20px` across all icon-only sizes** — only the padding (and therefore square footprint) scales. With-text buttons use the smaller `13px` icon at `s`/`m` and the `20px` icon at `l`/`xl`.

---

## Brand Link — Hierarchy × State matrix (`md` size)

| Hierarchy  | State    | bg   | border                                             | text                       | underline?                                 | source       |
| ---------- | -------- | ---- | -------------------------------------------------- | -------------------------- | ------------------------------------------ | ------------ |
| Link color | Default  | none | none                                               | `#4C42CF`                  | no                                         | 7:3992       |
| Link color | Hover    | none | none                                               | `#382EA5` (Hover purple)   | no                                         | 7:4184       |
| Link color | Focused  | none | `2px` `#0A84FF` ring, 4px gap, outer radius `10px` | `#4C42CF`                  | no                                         | 7:4109       |
| Link color | Disabled | none | none                                               | `#D1D4D8` (Gray 3)         | no                                         | 7:4049       |
| Link color | Loading  | none | none                                               | `#382EA5` + `20px` spinner | no                                         | 7:4192       |
| Link black | Default  | none | none                                               | `#000000`                  | no                                         | 7:4000       |
| Link black | Hover    | none | none                                               | `#000000`                  | **YES** (text underline, solid, from-font) | 7:4198       |
| Link black | Focused  | none | Focus Blue ring (extrapolated)                     | `#000000`                  | no                                         | extrapolated |
| Link black | Disabled | none | none                                               | `#D1D4D8`                  | no                                         | 7:4057       |
| Link black | Loading  | none | none                                               | `#000000` + `20px` spinner | no                                         | 7:4202       |
| Link White | Default  | none | none                                               | `#FFFFFF`                  | no                                         | 7:3996       |
| Link White | Hover    | none | none                                               | `#FFFFFF`                  | **YES** (text underline, solid, from-font) | 7:4188       |
| Link White | Focused  | none | Focus Blue ring (extrapolated)                     | `#FFFFFF`                  | no                                         | extrapolated |
| Link White | Disabled | none | none                                               | `#E4E6E9`                  | no                                         | 7:4053       |
| Link White | Loading  | none | none                                               | `#FFFFFF` + `20px` spinner | no                                         | 7:4195       |

### Important Link asymmetry

**`Link color` Hover** changes text color (`#4C42CF` → `#382EA5`) and adds **no underline**.
**`Link black` and `Link White` Hover** keep their text color and add **an underline**.

The SCSS module must branch the Hover rule by Hierarchy — it is not a uniform "underline on hover" rule.

---

## Brand Link — Per-size dimensions (Link color Default)

| Size | padding | font-size | font-weight | line-height | text-transform | icon-size | gap   |
| ---- | ------- | --------- | ----------- | ----------- | -------------- | --------- | ----- |
| `s`  | none    | `14px`    | `700`       | `21.7px`    | **none**       | `13px`    | `4px` |
| `m`  | none    | `14px`    | `700`       | `21.7px`    | **uppercase**  | `13px`    | `4px` |
| `l`  | none    | `16px`    | `700`       | `24px`      | **uppercase**  | `20px`    | `6px` |

Links have **zero padding** in every state (inline text). The Focused state's `2px` ring + `4px` inner gap is the focus-ring overlay only, not padding on the underlying anchor.

**No `xl` size exists for Links.** Buttons cap at `xl`; Links cap at `l`.

---

## Focus state

- **Outline color**: `#0A84FF` (Figma variable `Button/Focus Blue`) — **identical across every Button hierarchy and every Link hierarchy**.
- **Outline width**: `2px` solid.
- **Outline mechanic**: outer `2px` border with `4px` inner gap (padding around the inner cell), outer corner radius bumped to `10px` while the inner cell keeps its `8px` radius.

The single Focus Blue color enables one shared CSS variable (`--button-focus-ring`) used by both Buttons and Text Link.

---

## Loading state details

- **Spinner**: 20px circular, rendered on the left of the label at all sizes.
- **Spinner color**: matches the cell's text/icon color in its Default state.
- **Label visibility**: label stays visible (e.g. swapped to `Submitting...`); text-transform drops uppercase (Loading uses the `Button 14 Space` / `Button 16 no-caps` style) regardless of size.
- **Background**: see the per-state matrix; the "Hover visuals for purple hierarchies, Default visuals for Black/White hierarchies" rule applies.

---

## Color palette to add as CSS variables

Implementation lands these as CSS custom properties in `packages/component-library-styles/primitiveColors.scss` (or a sibling file `buttonColors.scss` if the design owner prefers separation).

| Hex                     | Figma label                    | Suggested CSS variable name     |
| ----------------------- | ------------------------------ | ------------------------------- |
| `#4C42CF`               | Primary / Primary Purple       | `--button-color-purple-primary` |
| `#382EA5`               | Primary / Primary Hover Purple | `--button-color-purple-hover`   |
| `#1F1976`               | Primary / Dark Purple          | `--button-color-purple-dark`    |
| `#E4E2F8`               | Primary / Light Purple         | `--button-color-purple-light`   |
| `#F8F6FF`               | Button / Light Primary Hover   | `--button-color-purple-tint`    |
| `#000000`               | Primary / Black                | `--button-color-black`          |
| `#FFFFFF`               | Primary / White                | `--button-color-white`          |
| `rgba(255,255,255,0.2)` | Button / White 20%             | `--button-color-white-alpha-20` |
| `#AFB8C2`               | Primary / Gray 4               | `--button-color-disabled-dark`  |
| `#D1D4D8`               | Primary / Gray 3               | `--button-color-link-disabled`  |
| `#E4E6E9`               | Neutrals / Gray 2              | `--button-color-disabled-light` |
| `#F2F2F2`               | Neutrals / Gray 1              | `--button-color-disabled-bg`    |
| `#0A84FF`               | Button / Focus Blue            | `--button-focus-ring`           |

The implementation may choose to alias these to existing brand-color variables where a 1:1 hex match exists in `primitiveColors.scss`; the alias mapping is documented in `data-model.md` when the plan re-runs.

---

## Surprises / asymmetries — implementation must encode

1. **`s` size and Loading state are NOT uppercase**; `m`/`l`/`xl` Default labels ARE uppercase. CSS must apply `text-transform: uppercase` conditionally on `size !== 's' && state !== 'loading'`.
2. **`xl` exists only for Buttons** — Links cap at `l`. The Text Link size enum is `s/m/l` (no `xl`).
3. **`Link color` Hover changes text color (no underline)**; **`Link black`/`Link White` Hover keep color and add underline**. SCSS Hover rule branches by Hierarchy.
4. **Icon-with-text uses `13px` icon at `s`/`m` and `20px` icon at `l`/`xl`**; **icon-only uses `20px` icon at ALL sizes**, with padding scaling the square footprint.
5. **Disabled bg differs by Type**: Primary uses `#F2F2F2` with a `1px` matching border; Secondary uses `transparent` with a `2px` `#AFB8C2` border (Gray 2 on White variants); Tertiary is fully `transparent` + Gray-4 text.
6. **Loading bg/border re-uses Hover treatment for purple hierarchies only.** For Black/White hierarchies, Loading bg/border stays at Default.
7. **No tertiary border in any state** — Tertiary is text-only with optional fill on Hover.
8. **Outer focus ring `border-radius: 10px`** while inner cell keeps `8px` — focus ring adds `2px` outer width + `4px` inner padding.
9. **`xl` letter-spacing is `-0.2px`** (only size with negative tracking).
10. **Variant count**: 405 symbols (vs 360 estimate) — the extra 45 come from the Link Hierarchies that were originally out of scope.
