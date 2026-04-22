/**
 * Unit tests for the www. redirect CloudFront Function defined in
 * cicd/3-app/template.yml.erb (WwwRedirectCloudFrontFunction).
 *
 * The CloudFront Function is embedded inline in the CloudFormation template.
 * These tests exercise the same logic to verify correctness. If the function
 * implementation changes in the template, update the handler below to match.
 *
 * CloudFront Functions event structure:
 * https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-event-structure.html
 */

// ---------------------------------------------------------------------------
// Handler — copied from WwwRedirectCloudFrontFunction in template.yml.erb.
// Keep in sync with the template.
// ---------------------------------------------------------------------------
function handler(event: CloudFrontFunctionEvent) {
  const request = event.request;
  const host = request.headers.host.value.replace(/^www\./i, '');
  const qs = request.rawQueryString;
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: {
      location: {value: 'https://' + host + request.uri + (qs ? '?' + qs : '')},
    },
  };
}

// ---------------------------------------------------------------------------
// Types — minimal subset of the CloudFront Functions event structure.
// ---------------------------------------------------------------------------
interface CloudFrontFunctionEvent {
  request: {
    headers: {host: {value: string}};
    uri: string;
    rawQueryString: string;
  };
}

function makeEvent(
  host: string,
  uri: string,
  rawQueryString = '',
): CloudFrontFunctionEvent {
  return {
    request: {
      headers: {host: {value: host}},
      uri,
      rawQueryString,
    },
  };
}

describe('www redirect CloudFront Function', () => {
  it('redirects www.example.net to example.net', () => {
    const result = handler(makeEvent('www.example.net', '/'));
    expect(result.statusCode).toBe(301);
    expect(result.headers.location.value).toBe('https://example.net/');
  });

  it('preserves the path', () => {
    const result = handler(makeEvent('www.example.net', '/about'));
    expect(result.headers.location.value).toBe('https://example.net/about');
  });

  it('preserves a deeply nested path', () => {
    const result = handler(makeEvent('www.example.net', '/my/path/here'));
    expect(result.headers.location.value).toBe(
      'https://example.net/my/path/here',
    );
  });

  it('preserves query string parameters', () => {
    const result = handler(
      makeEvent(
        'www.example.net',
        '/donate',
        'utm_source=email&utm_campaign=spring',
      ),
    );
    expect(result.headers.location.value).toBe(
      'https://example.net/donate?utm_source=email&utm_campaign=spring',
    );
  });

  it('preserves path and query string together', () => {
    const result = handler(
      makeEvent('www.example.net', '/my/path/here', 'queryOne=two&queryTwo=3'),
    );
    expect(result.headers.location.value).toBe(
      'https://example.net/my/path/here?queryOne=two&queryTwo=3',
    );
  });

  it('omits the ? when there is no query string', () => {
    const result = handler(makeEvent('www.example.net', '/about', ''));
    expect(result.headers.location.value).toBe('https://example.net/about');
  });

  it('is case-insensitive for the www. prefix', () => {
    const result = handler(makeEvent('WWW.example.net', '/'));
    expect(result.headers.location.value).toBe('https://example.net/');
  });

  it('works for any domain', () => {
    const result = handler(makeEvent('www.example.org', '/'));
    expect(result.headers.location.value).toBe('https://example.org/');
  });

  it('always returns a 301 Moved Permanently', () => {
    const result = handler(makeEvent('www.example.net', '/'));
    expect(result.statusCode).toBe(301);
    expect(result.statusDescription).toBe('Moved Permanently');
  });

  it('preserves encoded characters in query string', () => {
    const result = handler(
      makeEvent('www.example.net', '/search', 'q=hello%20world&lang=en'),
    );
    expect(result.headers.location.value).toBe(
      'https://example.net/search?q=hello%20world&lang=en',
    );
  });
});
