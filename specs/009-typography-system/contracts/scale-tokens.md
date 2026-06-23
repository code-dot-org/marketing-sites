# Contract: Scale Tokens (Figma-Locked Values)

**Feature**: [spec.md](../spec.md) · **Data model**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md) §R1

This is the **authoritative table** of every (track, size) cell. Values come from the visible labels embedded in Figma file `Aw6YXqpx6QFlNMXqCKk60e` (Space Grotesk node `36:874`, Geist node `36:975`), per the user's instruction that the Figma variable names are mislabeled.

## Display track — Space Grotesk

| Size  | `fontSize` | `lineHeight` | `letterSpacing` (CSS) | Figma node | Pixel (16px root) |
| ----- | ---------- | ------------ | --------------------- | ---------- | ----------------- |
| `4xl` | `7.5rem`   | `8.125rem`   | `-0.02em` (`-2%`)     | `36:907`   | 120px / 130px     |
| `3xl` | `5.625rem` | `6.875rem`   | `-0.02em`             | `36:916`   | 90px / 110px      |
| `2xl` | `4.5rem`   | `5.625rem`   | `-0.02em`             | `36:925`   | 72px / 90px       |
| `xl`  | `3.75rem`  | `4.5rem`     | `-0.02em`             | `36:934`   | 60px / 72px       |
| `lg`  | `3rem`     | `3.75rem`    | `-0.02em`             | `36:943`   | 48px / 60px       |
| `md`  | `2.25rem`  | `2.75rem`    | `-0.02em`             | `36:952`   | 36px / 44px       |
| `sm`  | `1.875rem` | `2.375rem`   | _(none)_              | `36:961`   | 30px / 38px       |
| `xs`  | `1.5rem`   | `2rem`       | _(none)_              | `36:970`   | 24px / 32px       |

## Text track — Geist

| Size  | `fontSize`        | `lineHeight`        | `letterSpacing` (CSS) | Figma node | Pixel (16px root) |
| ----- | ----------------- | ------------------- | --------------------- | ---------- | ----------------- |
| `4xl` | `2.25rem`         | `2.75rem`           | `-0.02em` (`-2%`)     | `36:1008`  | 36px / 44px       |
| `3xl` | `1.875rem`        | `2.375rem`          | _(none)_              | `36:1017`  | 30px / 38px       |
| `2xl` | `1.5rem`          | `2rem`              | _(none)_              | `36:1026`  | 24px / 32px       |
| `xl`  | `1.25rem`         | `1.875rem`          | _(none)_              | `36:1035`  | 20px / 30px       |
| `lg`  | `1.125rem`        | `1.75rem`           | _(none)_              | `36:1044`  | 18px / 28px       |
| `md`  | `1rem` **LOCKED** | `1.5rem` **LOCKED** | _(none)_              | `36:1053`  | 16px / 24px       |
| `sm`  | `0.875rem`        | `1.25rem`           | _(none)_              | `36:1062`  | 14px / 20px       |
| `xs`  | `0.75rem`         | `1.125rem`          | _(none)_              | `36:1071`  | 12px / 18px       |

## Weights (both tracks)

| Token      | CSS `font-weight` | Figma label (node 36:874 / 36:975) |
| ---------- | ----------------- | ---------------------------------- |
| `regular`  | `400`             | "Regular" (36:886 / 36:987)        |
| `medium`   | `500`             | "Medium" (36:891 / 36:992)         |
| `semibold` | `600`             | "Semibold" (36:896 / 36:997)       |
| `bold`     | `700`             | "Bold" (36:901 / 36:1002)          |

## Verification snapshot

To verify the implementation matches this contract:

```ts
import {
  SCALE_DISPLAY,
  SCALE_TEXT,
  WEIGHTS,
} from '@/themes/code.org/typography/tokens';

// Display 2xl (H1's locked cell)
expect(SCALE_DISPLAY['2xl']).toEqual({
  fontSize: '4.5rem',
  lineHeight: '5.625rem',
  letterSpacing: '-0.02em',
});

// Text md (body default's locked cell)
expect(SCALE_TEXT.md).toEqual({
  fontSize: '1rem',
  lineHeight: '1.5rem',
});

// Weights
expect(WEIGHTS).toEqual({
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
});
```

## Notes

- **`letterSpacing` representation**: `-2%` in Figma → `-0.02em` in CSS. `em` is relative to the element's own font-size, matching Figma's percentage semantics. Do not use `-2%` literally — CSS `letter-spacing: -2%` is invalid (`letter-spacing` does not accept `%`).
- **Same-pixel collisions**: Display md (36px / 44px) and Text 4xl (36px / 44px) collide on dimensions; Display sm (30px / 38px) and Text 3xl (30px / 38px) collide; Display xs (24px / 32px) and Text 2xl (24px / 32px) collide. The collisions are by design — different families, same metric — and the tokens stay separate at the type-system level so consumers pick the right family by track.
- **Sub-1rem cells**: Text sm (0.875rem / 14px) and Text xs (0.75rem / 12px) are below the 1rem body floor. These are valid for captions / overlines / metadata, NOT for headings. The floor invariant in `buildTypography` only checks the heading roles.
