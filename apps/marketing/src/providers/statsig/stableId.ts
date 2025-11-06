import {Brand} from '@/config/brand';

export const STATSIG_STABLE_ID_COOKIE_NAME = 'statsig_stable_id';

export const STATSIG_STABLE_ID_COOKIE_OPTIONS = {
  path: '/',
  domain: '.code.org',
  sameSite: 'lax' as const,
  secure: true,
};

export type StatsigUserIdentifiers = {
  customIDs?: {
    stableID: string;
  };
};

export function buildStatsigUserIdentifiers(
  stableId: string | undefined,
): StatsigUserIdentifiers {
  return stableId ? {customIDs: {stableID: stableId}} : {};
}

export function shouldUseStatsigStableId(brand: Brand): boolean {
  return brand === Brand.CODE_DOT_ORG;
}
