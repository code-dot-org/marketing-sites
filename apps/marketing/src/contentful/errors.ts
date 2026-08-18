// Helpers for detecting Contentful API errors by shape.
//
// The contentful.js client (contentful-sdk-core errorHandler) throws an Error
// with `name` set to the API error's `sys.id` and `message` set to the
// JSON-stringified error body.

// CSFORALL-COMPAT: detects the old content model (still used by the CSforAll
// Contentful space). Remove when csforall is retired.
/** A CDA 422 for a `select` on a field that doesn't exist in the environment. */
export const isUnknownFieldError = (e: unknown): boolean =>
  e instanceof Error && e.name === 'UnknownField';

/** A CDA 400 for a query on a content type that doesn't exist in the environment. */
export const isUnknownContentTypeError = (e: unknown): boolean => {
  if (!(e instanceof Error) || e.name !== 'InvalidQuery') {
    return false;
  }

  try {
    const body = JSON.parse(e.message);
    return body?.details?.errors?.some(
      (detail: {name?: string}) => detail?.name === 'unknownContentType',
    );
  } catch {
    return false;
  }
};
