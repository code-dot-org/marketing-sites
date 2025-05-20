'use client';
import {useEffect} from 'react';

import {getEnv} from '@/providers/environment';
import {initializeNewRelic} from '@/providers/newrelic/initialize';

const NewRelicLoader = () => {
  if (getEnv('NEXT_PUBLIC_INSTRUMENTATION_ENABLED') !== 'true') {
    return null;
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeNewRelic()
        .then(() => {
          console.debug('New Relic initialized');
        })
        .catch(error => console.debug('Error initializing New Relic:', error));
    }
  }, []);

  return null;
};

export default NewRelicLoader;
