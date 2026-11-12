import {Metadata} from 'next';

import {Brand} from '@/config/brand';
import {getProductionCanonicalRootDomain} from '@/config/host';
import {getIcons} from '@/config/metadata/icons';
import {BRAND_OPENGRAPH_DEFAULT_IMAGE_URL} from '@/config/metadata/opengraph';

import {REPORT_TITLE} from './constants';
import {nationalPrintPath, overviewPath, printPath, statePath} from './paths';

type Page =
  | {kind: 'overview'}
  | {kind: 'state'; slug: string; name: string}
  | {kind: 'print'; slug: string; name: string}
  | {kind: 'nationalPrint'};

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
    case 'nationalPrint':
      return {
        title: `National printable report | ${REPORT_TITLE}`,
        description:
          'The printable national State of Digital Fluency report: score distribution, policy landscape, trends and highlights.',
        path: nationalPrintPath(),
      };
  }
}

/** Metadata for the report's pages on code.org. Printable pages are noindex. */
export function buildReportMetadata(page: Page, locale: string): Metadata {
  const {title, description, path} = copy(page);
  const canonicalRoot = getProductionCanonicalRootDomain(Brand.CODE_DOT_ORG);

  return {
    title,
    description,
    icons: getIcons(Brand.CODE_DOT_ORG),
    alternates: {canonical: `https://${canonicalRoot}/${locale}${path}`},
    ...((page.kind === 'print' || page.kind === 'nationalPrint') && {
      robots: {index: false, follow: true},
    }),
    openGraph: {
      type: 'website',
      locale,
      title,
      description,
      url: './',
      images: BRAND_OPENGRAPH_DEFAULT_IMAGE_URL[Brand.CODE_DOT_ORG],
    },
  };
}
