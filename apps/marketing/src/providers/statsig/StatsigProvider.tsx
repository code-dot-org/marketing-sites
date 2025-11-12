'use client';

import {StatsigProvider as BaseStatsigProvider} from '@statsig/react-bindings';
import {ReactNode} from 'react';

import {Brand} from '@/config/brand';
import {Stage} from '@/config/stage';
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
  if (!clientKey) {
    console.debug(
      `[Statsig] Missing environment variable STATSIG_CLIENT_KEY. Statsig will not be enabled.`,
    );
    return children;
  }

  const client = getClient(clientKey, stage, brand);

  return <BaseStatsigProvider client={client}>{children}</BaseStatsigProvider>;
}
