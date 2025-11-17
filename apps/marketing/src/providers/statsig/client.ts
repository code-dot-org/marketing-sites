import {StatsigClient, StatsigUser} from '@statsig/js-client';
import {useStatsigClient} from '@statsig/react-bindings';
import {setCookie} from 'cookies-next';
import {getCookie} from 'cookies-next/client';
import {v4 as uuidv4} from 'uuid';

import {Brand} from '@/config/brand';
import {Stage} from '@/config/stage';
import {OneTrustCookieGroup} from '@/providers/onetrust/context/OneTrustContext';
import plugins from '@/providers/statsig/plugins';

function getStatsigStableId(allowedCookies?: Set<OneTrustCookieGroup>) {
  if (!allowedCookies?.has(OneTrustCookieGroup.Performance)) {
    // If the user has not allowed performance cookies, we do not set a stable ID
    return undefined;
  }

  let stableId = getCookie('statsig_stable_id');

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

export async function getClient(
  clientKey: string,
  stage: Stage,
  brand: Brand,
  allowedCookies?: Set<OneTrustCookieGroup>,
) {
  // Add stableID only for code.org brand so we can track users across
  // studio.code.org and code.org, otherwise fallback to Statsig SDK's default behavior
  const stableId =
    brand === Brand.CODE_DOT_ORG
      ? getStatsigStableId(allowedCookies)
      : undefined;
  const user: StatsigUser = stableId ? {customIDs: {stableID: stableId}} : {};
  const statsigClient = new StatsigClient(clientKey, user, {
    environment: {tier: stage},
    plugins: stage === 'production' ? plugins : undefined,
  });

  await statsigClient.initializeAsync();

  return statsigClient;
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
