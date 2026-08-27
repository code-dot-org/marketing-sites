import {getBrandFromHostname} from '@/config/brand';
import {isAllowedProductionCanonicalHostname} from '@/config/host';
import {getStage} from '@/config/stage';

/**
 * Only the production canonical hostnames (code.org, csforall.org,
 * hourofcode.com) may be crawled and indexed. Every other host — test, preview,
 * load balancer, CloudFront alias, localhost — is off limits regardless of the
 * page-level SEO flags in Contentful.
 *
 * Shared by robots.txt and the `X-Robots-Tag` middleware so the two signals
 * cannot disagree.
 */
export function isIndexableHost(hostname: string | null): boolean {
  return (
    getStage() === 'production' &&
    isAllowedProductionCanonicalHostname(
      getBrandFromHostname(hostname),
      hostname,
    )
  );
}
