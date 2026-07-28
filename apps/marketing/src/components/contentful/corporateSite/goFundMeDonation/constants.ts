// The SDK script is fixed for our org (46177) regardless of which form is
// embedded, so it is hard-coded rather than authored in Contentful.
export const GOFUNDME_SDK_SRC =
  'https://giving.gofundme.com/embedded/api/checkout/sdk/js/46177';

// Runtime guards for the two ids bound from a "GoFundMe Form" entry. The
// entry-only binding in the Studio definition is a UI constraint, not a
// server-side guarantee, so anything failing these patterns is never
// rendered into the DOM.
export const FORM_DIV_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
export const FORM_CLASSY_ID_PATTERN = /^\d+$/;
