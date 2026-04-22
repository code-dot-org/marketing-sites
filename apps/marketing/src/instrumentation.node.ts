import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {resourceFromAttributes} from '@opentelemetry/resources';
import {NodeSDK} from '@opentelemetry/sdk-node';
import {ATTR_SERVICE_NAME} from '@opentelemetry/semantic-conventions';
import {
  SentryAsyncLocalStorageContextManager,
  SentryPropagator,
} from '@sentry/opentelemetry';
import {FetchInstrumentation} from '@vercel/otel';
import {ClientRequest} from 'node:http';

import SpanProcessor from '@/otel/SpanProcessor';

// URL-prefix patterns for requests whose spans we don't want to ingest — asset fetches and health checks are pure
// noise. Applied at the instrumentation layer via ignoreIncomingRequestHook so the span is never created, rather
// than being created and then dropped by a custom sampler.
const IGNORED_REQUEST_PREFIXES = ['/_next/', '/images/', '/api/health_check'];

/**
 * If debugging OpenTelemetry, uncomment the following lines to enable console logs
 *
 // import {diag, DiagConsoleLogger, DiagLogLevel} from '@opentelemetry/api';
 // diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
 */

// Register OpenTelemetry for the marketing app
// See: https://nextjs.org/docs/app/guides/opentelemetry
if (process.env.NEXT_PUBLIC_INSTRUMENTATION_ENABLED === 'true') {
  console.debug(
    `Sending OpenTelemetry traces to ${process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}`,
  );

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: '@code-dot-org/marketing',
    }),
    spanProcessors: [SpanProcessor.getInstance()],
    contextManager: new SentryAsyncLocalStorageContextManager(),
    textMapPropagator: new SentryPropagator(),
    // Sampling is configured via standard OTel env vars: OTEL_TRACES_SAMPLER (default "parentbased_always_on") and
    // OTEL_TRACES_SAMPLER_ARG. In production we set OTEL_TRACES_SAMPLER=parentbased_traceidratio with
    // OTEL_TRACES_SAMPLER_ARG=0.01 so browser-initiated traces (with sampled `traceparent`/`sentry-trace`) continue
    // on the server while trace roots (direct navigations, SSR, background jobs) use the 1% ratio. Unset env vars
    // leave NodeSDK at its "parentbased_always_on" default, which is the desired behavior for local development.
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable some noisy auto instrumentations
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-net': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-dns': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          // Drop spans for asset fetches and health-check probes before they are created — these are pure noise and
          // would otherwise eat sampling budget and clutter the Sentry Performance view.
          ignoreIncomingRequestHook: request => {
            const url = request.url ?? '';
            return IGNORED_REQUEST_PREFIXES.some(prefix =>
              url.startsWith(prefix),
            );
          },
          // This gives your request spans a more meaningful name than `GET`
          // This sets the name to `GET code.org/xyz/123` instead of just `GET`
          requestHook: (span, request) => {
            const urlPath =
              request instanceof ClientRequest
                ? `${request.host}${request.path}`
                : request.url;

            if (urlPath) {
              span.updateName(`${request.method} ${urlPath}`);

              span.setAttribute('http.route', urlPath);
            }
          },
        },
      }),
      new FetchInstrumentation(),
    ],
  });
  sdk.start();
} else {
  console.debug(
    'NEXT_PUBLIC_INSTRUMENTATION_ENABLED not set, skipping OpenTelemetry instrumentation',
  );
}

// Convert Next.js console logs to pino format. This must be done after the pino instrumentation is loaded.
await import('next-logger');
