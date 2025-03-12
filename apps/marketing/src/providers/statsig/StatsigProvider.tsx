'use client';

import {ReactNode} from 'react';
import {StatsigProvider as BaseStatsigProvider} from '@statsig/react-bindings';
import {getClient} from '@/providers/statsig/client';

interface StatsigProviderProps {
  children: ReactNode;
  values: string;
}

export default function StatsigProvider({
  values,
  children,
}: StatsigProviderProps) {
  if (!process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY) {
    console.debug(
      `[Statsig] Missing environment variable NEXT_PUBLIC_STATSIG_CLIENT_KEY. Statsig will not be enabled.`,
    );
    return children;
  }

  const client = getClient(process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY, values);

  return <BaseStatsigProvider client={client}>{children}</BaseStatsigProvider>;
}
