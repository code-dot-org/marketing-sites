import {StatsigUser} from '@statsig/statsig-node-core';

import {Brand} from '@/config/brand';
import {
  buildStatsigUserIdentifiers,
  shouldUseStatsigStableId,
} from '@/providers/statsig/stableId';
import statsig from '@/providers/statsig/statsig';

const statsigInitializer = statsig ? statsig.initialize() : undefined;

interface GenerateBootstrapValuesArgs {
  brand: Brand;
  stableId?: string;
}

export async function generateBootstrapValues({
  brand,
  stableId,
}: GenerateBootstrapValuesArgs): Promise<string> {
  if (!statsig) {
    console.debug(
      `Missing environment variable STATSIG_SERVER_KEY, Statsig bootstrap will not be provided.`,
    );
    return Promise.resolve('');
  }

  const identifiers = shouldUseStatsigStableId(brand)
    ? buildStatsigUserIdentifiers(stableId)
    : {};
  const user = new StatsigUser({
    userID: 'marketing-user',
    customIDs: identifiers.customIDs,
  });
  await statsigInitializer;

  return statsig.getClientInitializeResponse(user, {
    hashAlgorithm: 'djb2',
  }) as string;
}
