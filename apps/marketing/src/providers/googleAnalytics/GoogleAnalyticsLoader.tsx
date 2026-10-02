import {GoogleAnalytics} from '@next/third-parties/google';
import Script from 'next/script';

/**
 * Loads gtag.js for the first measurement ID and configures the rest as extra
 * destinations, so events (including `sendGAEvent`) reach every property.
 * `GoogleAnalytics` can't be rendered twice: its scripts use fixed IDs.
 */
const GoogleAnalyticsLoader = ({
  measurementIds,
}: {
  measurementIds: string[];
}) => {
  const [gaId, ...additionalIds] = measurementIds;
  if (!gaId) {
    return null;
  }

  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      {additionalIds.length > 0 && (
        <Script id="ga-additional-config">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          ${additionalIds.map(id => `gtag('config', '${id}');`).join('\n')}
        `}</Script>
      )}
    </>
  );
};

export default GoogleAnalyticsLoader;
