export const createFontStackWithFallbacks = (
  primary: string,
  fallbacks: readonly string[],
): string => [primary, ...fallbacks, 'sans-serif'].join(', ');
