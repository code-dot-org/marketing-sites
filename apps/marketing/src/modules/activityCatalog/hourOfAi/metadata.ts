import {Metadata} from 'next';

import {Brand} from '@/config/brand';
import {getProductionCanonicalRootDomain} from '@/config/host';
import {getIcons} from '@/config/metadata/icons';
import {BRAND_OPENGRAPH_DEFAULT_IMAGE_URL} from '@/config/metadata/opengraph';
import {CATALOG_PATH} from '@/modules/activityCatalog/hourOfAi/paths';

const COPY = {
  title: 'Hour of AI Activities',
  description:
    'Explore free Hour of AI activities. From lessons to hands-on projects, anyone can dive into AI learning with fun, accessible experiences.',
  keywords: [
    'Hour of AI',
    'Artificial Intelligence for Students',
    'Hour of Code',
    'Computer Science Education',
    'AI Activities for Kids',
    'Code.org',
    'CS Education Week',
    'Teach AI',
    'One Hour Coding',
    'hour of ai activities',
    'free AI lessons',
    '1-hour AI projects',
    'AI activities for classrooms',
    'AI learning resources',
  ],
};

/** Metadata for the catalog page on hourofai.org. */
export function buildCatalogMetadata({locale}: {locale: string}): Metadata {
  const canonicalRoot = getProductionCanonicalRootDomain(Brand.HOUR_OF_AI);

  return {
    title: COPY.title,
    icons: getIcons(Brand.HOUR_OF_AI),
    description: COPY.description,
    keywords: COPY.keywords,
    alternates: {
      canonical: `https://${canonicalRoot}/${locale}${CATALOG_PATH}`,
    },
    openGraph: {
      type: 'website',
      locale,
      title: COPY.title,
      description: COPY.description,
      url: './',
      images: BRAND_OPENGRAPH_DEFAULT_IMAGE_URL[Brand.HOUR_OF_AI],
    },
  };
}
