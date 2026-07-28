// Runtime guards for the two ids bound from a "GoFundMe Form" entry. The
// entry-only binding in the Studio definition is a UI constraint, not a
// server-side guarantee, so anything failing these patterns is never
// rendered into the DOM.
export const FORM_DIV_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
export const FORM_CLASSY_ID_PATTERN = /^\d+$/;
