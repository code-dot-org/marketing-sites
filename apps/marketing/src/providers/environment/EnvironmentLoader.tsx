import Script from 'next/script';

import {getAssetPublicPath} from '@/config/assets';
import {Brand} from '@/config/brand';
import {PUBLIC_ENV_KEY} from '@/providers/environment/constants';

const EnvironmentLoader = ({brand}: {brand: Brand}) => {
  const publicEnvironmentVariables = {
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE,
  };

  return (
    <>
      <Script
        strategy={'beforeInteractive'}
        dangerouslySetInnerHTML={{
          __html: `window['${PUBLIC_ENV_KEY}'] = ${JSON.stringify(publicEnvironmentVariables)}`,
        }}
      />
      {/* Load subdomain statsig stable id script for sites that have subdomain tracking enabled */}
      {brand === Brand.CODE_DOT_ORG && (
        <Script
          src={`${getAssetPublicPath()}/assets/js/statsig-stable-id.min.js`}
          strategy="beforeInteractive"
        />
      )}
    </>
  );
};

export default EnvironmentLoader;
