export type RadiusToken = 'none' | 'sm' | 'md' | 'lg';

// Per-brand values live in component-library-styles/radii.scss.
export const brandRadius = (token: RadiusToken) =>
  `var(--codeai-radius-${token})`;
