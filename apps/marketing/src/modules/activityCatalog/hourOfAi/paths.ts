import {ActivityType} from '@/modules/activityCatalog/types/Activity';

/**
 * Catalog paths on hourofai.org. The site is the Hour of AI site, so its own
 * catalog sits at the bare path and only Hour of Code carries a prefix.
 */
export const HOUR_OF_AI_CATALOG_PATH = '/activities';
export const HOUR_OF_CODE_CATALOG_PATH = '/hour-of-code/activities';

export function getCatalogPath(activityType: ActivityType) {
  return activityType === ActivityType.HOUR_OF_AI
    ? HOUR_OF_AI_CATALOG_PATH
    : HOUR_OF_CODE_CATALOG_PATH;
}
