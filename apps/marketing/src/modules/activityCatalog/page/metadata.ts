import {Metadata} from 'next';

import {Brand} from '@/config/brand';
import {getProductionCanonicalRootDomain} from '@/config/host';
import {getIcons} from '@/config/metadata/icons';
import {getActivityCatalogPath} from '@/modules/activityCatalog/paths';
import {ActivityType} from '@/modules/activityCatalog/types/Activity';

/**
 * Builds the metadata for an activity catalog page. The canonical follows the
 * brand's URL structure (see getActivityCatalogPath).
 */
export function buildActivityCatalogMetadata({
  brand,
  locale,
  activityType,
}: {
  brand: Brand;
  locale: string;
  activityType: ActivityType;
}): Metadata {
  return {
    title: 'Hour of AI Activities',
    icons: getIcons(brand),
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
    alternates: {
      canonical: `https://${getProductionCanonicalRootDomain(brand)}/${locale}${getActivityCatalogPath(brand, activityType)}`,
    },
    openGraph: {
      type: 'website',
      locale: locale,
      title: 'Hour of AI Activities',
      description:
        'Explore free Hour of AI activities. From lessons to hands-on projects, anyone can dive into AI learning with fun, accessible experiences.',
      url: './',
      images:
        'https://contentful-images.code.org/27jkibac934d/6twVI3a8N6IoRIvwGuPMDq/c96010513f029b80a86e193b7a098135/hourofai_logo_og.jpg',
    },
  };
}
