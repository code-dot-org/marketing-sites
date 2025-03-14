import {GoogleAnalytics} from '@next/third-parties/google';
import {headers} from 'next/headers';
import {getGoogleAnalyticsMeasurementId} from '@/config/ga4';
import {getBrandFromHostname} from '@/config/brand';
import {generateBootstrapValues} from '@/providers/statsig/statsig-backend';
import StatsigProvider from '@/providers/statsig/StatsigProvider';
import {getStage} from '@/config/stage';

/**
 * Nested asynchronous layout to temporarily workaround Font Awesome imports going out of order due to CSS Chunking
 *
 * Long term fix: https://codedotorg.atlassian.net/browse/CMS-413
 */
export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hostname = (await headers()).get('Host');
  const brand = getBrandFromHostname(hostname);
  const googleAnalyticsMeasurementId = getGoogleAnalyticsMeasurementId(brand);
  const statsigBootstrapValues = await generateBootstrapValues();
  const statsigClientKey = process.env.STATSIG_CLIENT_KEY;

  return (
    <>
      {googleAnalyticsMeasurementId && (
        <GoogleAnalytics gaId={googleAnalyticsMeasurementId} />
      )}
      <StatsigProvider
        stage={getStage()}
        clientKey={statsigClientKey}
        values={statsigBootstrapValues}
      >
        {children}
      </StatsigProvider>
    </>
  );
}
