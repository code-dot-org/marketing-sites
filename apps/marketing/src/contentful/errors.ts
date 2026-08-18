// CSFORALL-COMPAT: helper for detecting the old content model (still used by
// the CSforAll Contentful space) by error shape. Remove when csforall is
// retired.
//
// The contentful.js client (contentful-sdk-core errorHandler) throws an Error
// with `name` set to the API error's `sys.id` and `message` set to the
// JSON-stringified error body.

/** A CDA 422 for a `select` on a field that doesn't exist in the environment. */
export const isUnknownFieldError = (e: unknown): boolean =>
  e instanceof Error && e.name === 'UnknownField';
