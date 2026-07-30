// LEGACY-ENV-COMPAT: helpers for detecting the old (pre-launch) Contentful
// environment by error shape. Remove when the production Contentful
// environment serves the new content model and the last caller is deleted.
//
// The contentful.js client (contentful-sdk-core errorHandler) throws an Error
// with `name` set to the API error's `sys.id` and `message` set to the
// JSON-stringified error body.

/** A CDA 422 for a `select` on a field that doesn't exist in the environment. */
export const isUnknownFieldError = (e: unknown): boolean =>
  e instanceof Error && e.name === 'UnknownField';

/** A CDA 400 for a query on a content type that doesn't exist in the environment. */
export const isUnknownContentTypeError = (e: unknown): boolean =>
  e instanceof Error &&
  e.name === 'InvalidQuery' &&
  e.message.includes('unknownContentType');
