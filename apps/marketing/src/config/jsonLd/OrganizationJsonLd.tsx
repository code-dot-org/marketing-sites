import {JsonLd} from 'react-schemaorg';
import {WithContext, EducationalOrganization} from 'schema-dts';

import {FOOTER_MISSION} from '@/components/footer/codeOrg/config';
import {Brand} from '@/config/brand';
import logoImage from '@public/images/codeai-logo-square.webp';

export const ORGANIZATION_ID = 'https://code.org/#organization';

/** See: https://developers.google.com/search/docs/appearance/structured-data/organization */
const BRANDS_ORG_JSON_LD: {
  [K in Brand]?: WithContext<EducationalOrganization>;
} = {
  [Brand.CODE_DOT_ORG]: {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': ORGANIZATION_ID,
    name: 'CodeAI',
    alternateName: 'Code.org',
    url: 'https://code.org/',
    // Square raster for Google (min 112x112); Next content-hashes the URL.
    logo: `https://code.org${logoImage.src}`,
    description: FOOTER_MISSION,
    nonprofitStatus: 'Nonprofit501c3',
    taxID: '46-0858543',
    foundingDate: '2013',
    founder: [
      {
        '@type': 'Person',
        name: 'Hadi Partovi',
        jobTitle: 'Founder and Chairman of the Board',
      },
      {
        '@type': 'Person',
        name: 'Ali Partovi',
        jobTitle: 'Co-Founder',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressRegion: 'WA',
      addressLocality: 'Seattle',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Help center',
      email: 'support@code.org',
      url: 'https://support.code.org/hc/requests/new',
    },
    sameAs: [
      'https://facebook.com/Code.org',
      'https://x.com/codeorg',
      'https://instagram.com/codeorg',
      'https://codeorg.medium.com',
      'https://youtube.com/codeorg',
      'https://www.linkedin.com/company/code-org',
      'https://en.wikipedia.org/wiki/Code.org',
      'https://github.com/code-dot-org',
    ],
  },
};

interface OrganizationJsonLdProps {
  brand: Brand;
}

const OrganizationJsonLd: React.FC<OrganizationJsonLdProps> = ({brand}) =>
  BRANDS_ORG_JSON_LD[brand] && <JsonLd item={BRANDS_ORG_JSON_LD[brand]} />;

export default OrganizationJsonLd;
