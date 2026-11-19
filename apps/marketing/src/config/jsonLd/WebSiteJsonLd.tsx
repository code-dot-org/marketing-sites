import {JsonLd} from 'react-schemaorg';
import {WithContext, WebSite} from 'schema-dts';

import {Brand} from '@/config/brand';
import {ORGANIZATION_ID} from '@/config/jsonLd/OrganizationJsonLd';

/**
 * Google's main site-name signal; it only reads this on the home page.
 * See: https://developers.google.com/search/docs/appearance/site-names
 */
const BRANDS_WEBSITE_JSON_LD: {
  [K in Brand]?: WithContext<WebSite>;
} = {
  [Brand.CODE_DOT_ORG]: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CodeAI',
    url: 'https://code.org/',
    publisher: {'@id': ORGANIZATION_ID},
  },
  [Brand.HOUR_OF_AI]: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hour of AI',
    url: 'https://hourofai.org/',
  },
};

interface WebSiteJsonLdProps {
  brand: Brand;
}

const WebSiteJsonLd: React.FC<WebSiteJsonLdProps> = ({brand}) =>
  BRANDS_WEBSITE_JSON_LD[brand] && (
    <JsonLd item={BRANDS_WEBSITE_JSON_LD[brand]} />
  );

export default WebSiteJsonLd;
