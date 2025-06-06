import {GoogleAnalytics} from '@next/third-parties/google';

import Footer from '@/components/footer';
import Header from '@/components/header';
import {Brand} from '@/config/brand';
import {getGoogleAnalyticsMeasurementId} from '@/config/ga4';
import OrganizationJsonLd from '@/config/jsonLd/OrganizationJsonLd';
import {getStage} from '@/config/stage';
import EnvironmentLoader from '@/providers/environment';
import LocalizeLoader from '@/providers/localize/LocalizeLoader';
import NewRelicLoader from '@/providers/newrelic/NewRelicLoader';
import OneTrustLoader from '@/providers/onetrust/OneTrustLoader';
import OneTrustProvider from '@/providers/onetrust/OneTrustProvider';
import {generateBootstrapValues} from '@/providers/statsig/statsig-backend';
import StatsigProvider from '@/providers/statsig/StatsigProvider';

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{brand: Brand; locale: string}>;
}>) {
  const syncParams = await params;
  const {brand, locale} = syncParams;

  const googleAnalyticsMeasurementId = getGoogleAnalyticsMeasurementId(brand);
  const statsigBootstrapValues = await generateBootstrapValues();
  const statsigClientKey = process.env.STATSIG_CLIENT_KEY;

  return (
    <html lang={locale}>
      <body>
        <EnvironmentLoader />
        <NewRelicLoader />
        <OneTrustLoader brand={brand} />
        <LocalizeLoader brand={brand} locale={locale} />

        <OneTrustProvider>
          {googleAnalyticsMeasurementId && (
            <GoogleAnalytics gaId={googleAnalyticsMeasurementId} />
          )}
          <StatsigProvider
            stage={getStage()}
            clientKey={statsigClientKey}
            values={statsigBootstrapValues}
          >
            <Header />
            {children}

            <Footer />
          </StatsigProvider>
        </OneTrustProvider>

        <OrganizationJsonLd brand={brand} />
      </body>
    </html>
  );
}
