type RadiusToken = 'none' | 'sm' | 'md' | 'lg';

// CodeAI corner-radius token reference. Values live in
// component-library-styles/radii.scss, scoped to [data-brand='Code.org'].
// The fallback is the call site's historical value so HOC (which shares this
// theme) keeps rendering unchanged.
export const codeaiRadius = (token: RadiusToken, fallback: string) =>
  `var(--codeai-radius-${token}, ${fallback})`;
