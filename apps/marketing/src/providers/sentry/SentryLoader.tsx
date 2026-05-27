'use client';

import {useEffect} from 'react';

import {getStage} from '@/config/stage';
import {getEnv} from '@/providers/environment';

// Initializes the Sentry browser SDK after hydration via a dynamic import so that a Sentry failure (bundle load,
// network error, SDK crash) cannot break page rendering. Mirrors the prior NewRelicLoader pattern — trade-off is
// that errors thrown during initial render and hydration are not captured on the client (server-side errors are
// still captured via Sentry.captureRequestError).
const SentryLoader = () => {
  useEffect(() => {
    const stage = getStage();
    if (stage !== 'test' && stage !== 'production') {
      return;
    }

    const dsn = getEnv('NEXT_PUBLIC_SENTRY_DSN');
    if (!dsn) {
      return;
    }

    import('@sentry/nextjs')
      .then(Sentry => {
        Sentry.init({
          dsn,
          environment: stage,
          release: getEnv('NEXT_PUBLIC_SENTRY_RELEASE'),
          sendDefaultPii: false,
          tracesSampleRate: 0.01,
          replaysSessionSampleRate: 0,
          replaysOnErrorSampleRate: 0,
        });
      })
      .catch(err => {
        // Sentry init must not affect the page. Log so dev console surfaces the issue; do not rethrow.
        console.warn('[SentryLoader] init failed', err);
      });
  }, []);

  return null;
};

export default SentryLoader;
