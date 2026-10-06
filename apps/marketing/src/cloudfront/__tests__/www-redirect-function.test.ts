import {readFileSync} from 'fs';
import path from 'path';

/**
 * Unit tests for the www. redirect CloudFront Function defined in
 * cicd/3-app/template.yml.erb (WwwRedirectCloudFrontFunction).
 *
 * The function's code is read straight out of the template, so these tests
 * always exercise what gets deployed.
 *
 * CloudFront Functions event structure:
 * https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-event-structure.html
 */

// ---------------------------------------------------------------------------
// Types — minimal subset of the CloudFront Functions (cloudfront-js-2.0)
// event structure. rawQueryString is a method, not a property.
// ---------------------------------------------------------------------------
interface CloudFrontFunctionEvent {
  request: {
    headers: {host: {value: string}};
    uri: string;
    rawQueryString: () => string | undefined;
  };
}

interface CloudFrontFunctionResult {
  statusCode: number;
  statusDescription: string;
  headers: {location: {value: string}};
}

const TEMPLATE_PATH = path.join(
  __dirname,
  '../../../cicd/3-app/template.yml.erb',
);

function loadHandler(): (
  event: CloudFrontFunctionEvent,
) => CloudFrontFunctionResult {
  const template = readFileSync(TEMPLATE_PATH, 'utf8');
  const match = template.match(
    /WwwRedirectCloudFrontFunction:[\s\S]*?FunctionCode: \|\n([\s\S]*?)\n\s*FunctionConfig:/,
  );
  if (!match) {
    throw new Error('WwwRedirectCloudFrontFunction code not found in template');
  }

  const lines = match[1].split('\n');
  const indent = Math.min(
    ...lines.filter(line => line.trim()).map(line => line.search(/\S/)),
  );
  const code = lines.map(line => line.slice(indent)).join('\n');

  return new Function(`${code}\nreturn handler;`)();
}

const handler = loadHandler();

function makeEvent(
  host: string,
  uri: string,
  rawQueryString?: string,
): CloudFrontFunctionEvent {
  return {
    request: {
      headers: {host: {value: host}},
      uri,
      rawQueryString: () => rawQueryString,
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

  // rawQueryString() returns undefined without a ? and '' for a bare ?
  it('omits the ? when there is no query string', () => {
    const result = handler(makeEvent('www.example.net', '/about'));
    expect(result.headers.location.value).toBe('https://example.net/about');
  });

  it('omits the ? when the query string is empty', () => {
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
