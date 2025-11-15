'use client';

import {StatsigClient} from '@statsig/js-client';
import {StatsigProvider as BaseStatsigProvider} from '@statsig/react-bindings';
import {ReactNode, useContext, useEffect, useState} from 'react';

import {Brand} from '@/config/brand';
import {Stage} from '@/config/stage';
import OneTrustContext from '@/providers/onetrust/context/OneTrustContext';
import {getClient} from '@/providers/statsig/client';

interface StatsigProviderProps {
  stage: Stage;
  clientKey?: string;
  children: ReactNode;
  brand: Brand;
}

export default function StatsigProvider({
  stage,
  clientKey,
  children,
  brand,
}: StatsigProviderProps) {
  const [client, setClient] = useState<StatsigClient | null>(null);
  const onetrustContext = useContext(OneTrustContext);
  const allowedCookies = onetrustContext?.allowedCookies;

  useEffect(() => {
    if (!clientKey) {
      setClient(null);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const statsigClient = await getClient(
          clientKey,
          stage,
          brand,
          allowedCookies,
        );

        if (isMounted) {
          setClient(statsigClient);
        }
      } catch (error) {
        console.warn('[Statsig] Failed to initialize Statsig client', error);
        if (isMounted) {
          setClient(null);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [clientKey, stage, brand, allowedCookies]);

  if (!clientKey) {
    console.debug(
      `[Statsig] Missing environment variable STATSIG_CLIENT_KEY. Statsig will not be enabled.`,
    );
    return children;
  }

  if (!client) {
    return children;
  }

  return <BaseStatsigProvider client={client}>{children}</BaseStatsigProvider>;
}
