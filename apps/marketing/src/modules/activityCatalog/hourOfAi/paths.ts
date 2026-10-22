import {
  ActivityType,
  ValidActivityTypes,
} from '@/modules/activityCatalog/types/Activity';

/** The catalog's path on hourofai.org, for both Hour of AI and Hour of Code. */
export const CATALOG_PATH = '/activities';

/** Search param for the catalog filter; absent means all activities. */
export const CATALOG_SEARCH_PARAM = 'cat';

/** The catalog a `cat` value selects, or undefined for all activities. */
export function parseCatalog(value: string | null | undefined) {
  return ValidActivityTypes.has(value as ActivityType)
    ? (value as ActivityType)
    : undefined;
}
