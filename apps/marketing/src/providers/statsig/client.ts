import {
  useStatsigClient,
  useClientBootstrapInit,
  StatsigUser,
} from '@statsig/react-bindings';
import {setCookie} from 'cookies-next';
import {getCookie} from 'cookies-next/client';
import {useContext} from 'react';
import {v4 as uuidv4} from 'uuid';

import {Brand} from '@/config/brand';
import {Stage} from '@/config/stage';
import OneTrustContext, {
  OneTrustCookieGroup,
} from '@/providers/onetrust/context/OneTrustContext';
import plugins from '@/providers/statsig/plugins';
import {
  STATSIG_STABLE_ID_COOKIE_NAME,
  STATSIG_STABLE_ID_COOKIE_OPTIONS,
  buildStatsigUserIdentifiers,
  shouldUseStatsigStableId,
} from '@/providers/statsig/stableId';

function useStatsigStableId(brand: Brand) {
  if (!shouldUseStatsigStableId(brand)) {
    return undefined;
  }

  const onetrustContext = useContext(OneTrustContext);

  if (!onetrustContext?.allowedCookies.has(OneTrustCookieGroup.Performance)) {
    // If the user has not allowed performance cookies, we do not set a stable ID
    return undefined;
  }

  let stableId = getCookie(STATSIG_STABLE_ID_COOKIE_NAME) ?? undefined;

  if (!stableId) {
    stableId = uuidv4();
    setCookie(
      STATSIG_STABLE_ID_COOKIE_NAME,
      stableId,
      STATSIG_STABLE_ID_COOKIE_OPTIONS,
    );
  }

  return stableId;
}

export function getClient(
  clientKey: string,
  stage: Stage,
  values: string,
  brand: Brand,
) {
  const stableId = useStatsigStableId(brand);
  const userIdentifiers = buildStatsigUserIdentifiers(stableId);
  const user: StatsigUser = {...userIdentifiers};
  return useClientBootstrapInit(clientKey, user, values, {
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
