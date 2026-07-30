// LEGACY-ENV-COMPAT: tests for old-environment error detection. Remove with errors.ts.
import {isUnknownContentTypeError, isUnknownFieldError} from '../errors';

// Builds an error the way contentful-sdk-core's errorHandler does:
// name = sys.id, message = JSON.stringify(error body).
function sdkError(sysId: string, details?: object) {
  const error = new Error(
    JSON.stringify({
      status: 400,
      message: 'The query you sent was invalid.',
      details,
    }),
  );
  error.name = sysId;
  return error;
}

describe('isUnknownFieldError', () => {
  it('matches an UnknownField error', () => {
    expect(isUnknownFieldError(sdkError('UnknownField'))).toBe(true);
  });

  it('does not match other SDK errors', () => {
    expect(isUnknownFieldError(sdkError('InvalidQuery'))).toBe(false);
    expect(isUnknownFieldError(new Error('boom'))).toBe(false);
  });

  it('does not match non-errors', () => {
    expect(isUnknownFieldError(undefined)).toBe(false);
    expect(isUnknownFieldError('UnknownField')).toBe(false);
  });
});

describe('isUnknownContentTypeError', () => {
  it('matches an InvalidQuery error for an unknown content type', () => {
    expect(
      isUnknownContentTypeError(
        sdkError('InvalidQuery', {
          errors: [{name: 'unknownContentType', value: 'DOESNOTEXIST'}],
        }),
      ),
    ).toBe(true);
  });

  it('does not match InvalidQuery errors with other causes', () => {
    expect(
      isUnknownContentTypeError(
        sdkError('InvalidQuery', {errors: [{name: 'invalidOrder'}]}),
      ),
    ).toBe(false);
  });

  it('does not match other SDK errors or non-errors', () => {
    expect(isUnknownContentTypeError(sdkError('UnknownField'))).toBe(false);
    expect(isUnknownContentTypeError(null)).toBe(false);
  });
});
