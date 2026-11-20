import {Metadata} from 'next';

import {Brand} from '@/config/brand';
import {getProductionCanonicalRootDomain} from '@/config/host';
import {getIcons} from '@/config/metadata/icons';
import {
  BRAND_OPENGRAPH_DEFAULT_IMAGE_URL,
  BRAND_SITE_NAME,
} from '@/config/metadata/opengraph';

import {REPORT_TITLE} from './constants';
import {overviewPath, printPath, statePath} from './paths';

type Page =
  | {kind: 'overview'}
  | {kind: 'state'; slug: string; name: string}
  | {kind: 'print'; slug: string; name: string};

function copy(page: Page) {
  switch (page.kind) {
    case 'overview':
      return {
        title: REPORT_TITLE,
        description:
          'State-by-state rankings and data on digital fluency: policy, high school access and participation in Digital Sciences courses.',
        path: overviewPath(),
      };
    case 'state':
      return {
        title: `${page.name} | ${REPORT_TITLE}`,
        description: `${page.name}'s Digital Fluency Index Score, Digital Sciences policies, high school access and participation, and national rankings.`,
        path: statePath(page.slug),
      };
    case 'print':
      return {
        title: `${page.name} printable report | ${REPORT_TITLE}`,
        description: `The printable State of Digital Fluency report for ${page.name}.`,
        path: printPath(page.slug),
      };
  }
}

/** Metadata for the report's pages on code.org. Printable pages are noindex. */
export function buildReportMetadata(page: Page, locale: string): Metadata {
  const {title, description, path} = copy(page);
  const canonicalRoot = getProductionCanonicalRootDomain(Brand.CODE_DOT_ORG);
  const canonical = `https://${canonicalRoot}/${locale}${path}`;

  return {
    title,
    description,
    icons: getIcons(Brand.CODE_DOT_ORG),
    alternates: {canonical},
    ...(page.kind === 'print' && {
      robots: {index: false, follow: true},
    }),
    openGraph: {
      type: 'website',
      siteName: BRAND_SITE_NAME[Brand.CODE_DOT_ORG],
      locale,
      title,
      description,
      url: canonical,
      images: BRAND_OPENGRAPH_DEFAULT_IMAGE_URL[Brand.CODE_DOT_ORG],
    },
  };
}
