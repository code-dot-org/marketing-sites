import {StatsigUser} from '@statsig/js-client';
import {useClientAsyncInit, useStatsigClient} from '@statsig/react-bindings';

import {Brand} from '@/config/brand';
import {Stage} from '@/config/stage';
import plugins from '@/providers/statsig/plugins';

function getStatsigStableId(brand: Brand) {
  if (brand !== Brand.CODE_DOT_ORG) {
    return undefined;
  }
  try {
    if (typeof localStorage === 'undefined') {
      return undefined;
    }

    return localStorage.getItem('STATSIG_LOCAL_STORAGE_STABLE_ID') || undefined;
  } catch {
    return undefined;
  }
}

export function getClient(clientKey: string, stage: Stage, brand: Brand) {
  // Add stableID only for code.org brand so we can track users across
  // studio.code.org and code.org, otherwise fallback to Statsig SDK's default behavior
  const stableId = getStatsigStableId(brand);
  const user: StatsigUser = stableId ? {customIDs: {stableID: stableId}} : {};
  return useClientAsyncInit(clientKey, user, {
    environment: {tier: stage},
    plugins: stage === 'production' ? plugins : undefined,
  });
}

// Log events in Statsig
export function useStatsigLogger() {
  const {client} = useStatsigClient();

  const logEvent = (
    eventName: string,
    value: string,
    metadata?: Record<string, string>,
  ) => {
    try {
      if (client) {
        client.logEvent(eventName, value, metadata);
      } else {
        console.debug(
          'Statsig client not available, skipping event:',
          eventName,
        );
      }
    } catch (error) {
      console.warn('Failed to log Statsig event:', error);
    }
  };

  return {logEvent};
}
