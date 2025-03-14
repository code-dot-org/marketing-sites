'use client';

import {ReactNode} from 'react';
import {StatsigProvider as BaseStatsigProvider} from '@statsig/react-bindings';
import {getClient} from '@/providers/statsig/client';

interface StatsigProviderProps {
  clientKey?: string;
  children: ReactNode;
  values: string;
}

export default function StatsigProvider({
  clientKey,
  values,
  children,
}: StatsigProviderProps) {
  if (!clientKey) {
    console.debug(
      `[Statsig] Missing environment variable STATSIG_CLIENT_KEY. Statsig will not be enabled.`,
    );
    return children;
  }

  const client = getClient(clientKey, values);

  return <BaseStatsigProvider client={client}>{children}</BaseStatsigProvider>;
}
