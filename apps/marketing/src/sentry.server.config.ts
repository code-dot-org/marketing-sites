import * as Sentry from '@sentry/nextjs';

import {getStage} from '@/config/stage';

// Match the browser SDK gate in SentryLoader.tsx: only initialize in `test` and `production`. Local `yarn dev`
// and PR environments must not report to Sentry even if a DSN is set in the env.
const stage = getStage();
if (stage === 'test' || stage === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: stage,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    skipOpenTelemetrySetup: true,
    sendDefaultPii: false,
    // Server traces are produced by the OTel NodeSDK in instrumentation.node.ts and forwarded to Sentry via OTLP.
    // Letting the Sentry SDK also generate transactions would double-send the same spans, so this stays at 0.
    tracesSampleRate: 0,
  });
}
