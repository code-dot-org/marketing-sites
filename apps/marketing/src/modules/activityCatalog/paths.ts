import {Brand} from '@/config/brand';
import {ActivityType} from '@/modules/activityCatalog/types/Activity';

/**
 * Returns the brand-specific catalog path for an activity type.
 * CSFORALL-COMPAT: csforall.org keeps its original `/activities/{type}` URL
 * structure until retirement; the Code.org brand serves `/{type}/activities`.
 */
export function getActivityCatalogPath(
  brand: Brand,
  activityType: ActivityType,
) {
  return brand === Brand.CS_FOR_ALL
    ? `/activities/${activityType}`
    : `/${activityType}/activities`;
}
