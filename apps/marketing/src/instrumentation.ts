import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_RUNTIME === 'nodejs') {
  await import('./sentry.server.config');
  await import('./instrumentation.node');
  await import('@opentelemetry/auto-instrumentations-node/register');
}

export async function register() {
  // Stubbed to enable opentelemetry instrumentation module BEFORE next.js itself loads
}

export const onRequestError = Sentry.captureRequestError;
