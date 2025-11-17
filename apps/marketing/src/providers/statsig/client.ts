import {StatsigUser} from '@statsig/js-client';
import {useClientAsyncInit, useStatsigClient} from '@statsig/react-bindings';
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

function getStatsigStableId(brand: Brand) {
  const onetrustContext = useContext(OneTrustContext);
  let stableId = getCookie('statsig_stable_id');

  if (!onetrustContext?.allowedCookies.has(OneTrustCookieGroup.Performance)) {
    // If the user has not allowed performance cookies, we do not set a stable ID
    // For the Code.org brand, the stable ID is retrieved from cookie to track users across subdomains
    // For the other brand, we do not set a stable ID as we do not need cross-domain tracking
    return brand === Brand.CODE_DOT_ORG ? stableId : undefined;
  }

  if (!stableId) {
    stableId = uuidv4();
    setCookie('statsig_stable_id', stableId, {
      path: '/',
      domain: '.code.org',
      sameSite: 'lax',
      secure: true,
    });
  }

  return stableId;
}

export function getClient(clientKey: string, stage: Stage, brand: Brand) {
  // Add stableID only for code.org brand so we can track users across
  // studio.code.org and code.org, otherwise fallback to Statsig SDK's default behavior
  const stableId =
    brand === Brand.CODE_DOT_ORG ? getStatsigStableId(brand) : undefined;
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
