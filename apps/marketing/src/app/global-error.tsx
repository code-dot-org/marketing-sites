'use client'; // Error boundaries must be Client Components

import * as Sentry from '@sentry/nextjs';
import {useEffect, useState} from 'react';

/**
 * This error boundary is for cases where the more specific error boundaries have all failed.
 * In this case, it is possible that an error occurred in the component library, middleware, or other core features.
 * Therefore, we cannot paint an error page based on those components (as they may be the cause of the error), and
 * instead must rely on plain HTML.
 */
export default function ErrorPage(props: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  const [eventId, setEventId] = useState<string>();

  // The same error is also captured server-side via `Sentry.captureRequestError` in instrumentation.ts. This
  // client-side call is additive — it carries the client error-boundary context (user, URL, browser) that the
  // server event does not, and gives the user a surfaced Event ID. Two events for one crash is intentional.
  useEffect(() => {
    setEventId(Sentry.captureException(props.error));
  }, [props.error]);

  return (
    <html lang="en">
      <body>
        <h1>This page isn't working</h1>
        <p>
          Uh oh! We ran into an internal server error and couldn't complete your
          request.
        </p>

        <span style={{display: 'flex', gap: 10}}>
          <button onClick={() => props.reset()}>Try again</button>
          <a href="https://status.code.org">
            <button>Check status page</button>
          </a>
        </span>

        <p>Error ID: {eventId}</p>

        <pre>{props.error?.stack}</pre>
      </body>
    </html>
  );
}
