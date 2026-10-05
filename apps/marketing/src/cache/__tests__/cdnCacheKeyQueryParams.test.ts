import {readFileSync} from 'fs';
import path from 'path';

import {CDN_CACHE_KEY_QUERY_PARAMS} from '@/cache/constants';

const TEMPLATE_PATH = path.join(
  __dirname,
  '../../../cicd/3-app/template.yml.erb',
);

// Redirects are cached on the assumption that this list matches CloudFront's
// cache key exactly; a mismatch serves one visitor's params to everyone.
describe('CDN_CACHE_KEY_QUERY_PARAMS', () => {
  it('matches the query strings in the CloudFront cache policy', () => {
    const template = readFileSync(TEMPLATE_PATH, 'utf8');
    const match = template.match(
      /ApplicationCachingPolicy:[\s\S]*?QueryStringsConfig:\s*\n\s*QueryStringBehavior: whitelist\s*\n\s*QueryStrings:\s*\n((?:\s*- .+\n)+)/,
    );
    if (!match) {
      throw new Error('ApplicationCachingPolicy query strings not found');
    }

    const templateParams = match[1]
      .split('\n')
      .map(line =>
        line
          .replace(/^\s*- /, '')
          .replace(/#.*$/, '')
          .trim(),
      )
      .filter(Boolean);

    expect(new Set(templateParams)).toEqual(CDN_CACHE_KEY_QUERY_PARAMS);
  });
});
