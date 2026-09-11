import {Metadata} from 'next';

import {Brand} from '@/config/brand';
import {getProductionCanonicalRootDomain} from '@/config/host';
import {getIcons} from '@/config/metadata/icons';
import {getCatalogPath} from '@/modules/activityCatalog/hourOfAi/paths';
import {ActivityType} from '@/modules/activityCatalog/types/Activity';

// TODO(hourofai): both catalogs share the Hour of AI logo because the Hour of
// AI space has no default OG image yet (see BRAND_OPENGRAPH_DEFAULT_IMAGE_URL).
const OPENGRAPH_IMAGE =
  'https://contentful-images.code.org/27jkibac934d/6twVI3a8N6IoRIvwGuPMDq/c96010513f029b80a86e193b7a098135/hourofai_logo_og.jpg';

const COPY = {
  [ActivityType.HOUR_OF_AI]: {
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
  },
  [ActivityType.HOUR_OF_CODE]: {
    title: 'Hour of Code Activities',
    description:
      'Explore free Hour of Code activities. From one-hour tutorials to hands-on projects, anyone can start learning computer science.',
    keywords: [
      'Hour of Code',
      'Computer Science Education',
      'Coding Activities for Kids',
      'Learn to Code',
      'Code.org',
      'CS Education Week',
      'One Hour Coding',
      'hour of code activities',
      'free coding lessons',
      '1-hour coding projects',
      'coding activities for classrooms',
      'computer science activities',
    ],
  },
};

/** Metadata for a catalog page on hourofai.org. */
export function buildCatalogMetadata({
  locale,
  activityType,
}: {
  locale: string;
  activityType: ActivityType;
}): Metadata {
  const copy = COPY[activityType];
  const canonicalRoot = getProductionCanonicalRootDomain(Brand.HOUR_OF_AI);

  return {
    title: copy.title,
    icons: getIcons(Brand.HOUR_OF_AI),
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical: `https://${canonicalRoot}/${locale}${getCatalogPath(activityType)}`,
    },
    openGraph: {
      type: 'website',
      locale,
      title: copy.title,
      description: copy.description,
      url: './',
      images: OPENGRAPH_IMAGE,
    },
  };
}
