import Script from 'next/script';

import {Brand} from '@/config/brand';
import {GOFUNDME_SDK_SRC} from '@/config/goFundMe';

/**
 * Loads the GoFundMe embedded checkout SDK on every Code.org page. Besides
 * rendering donation forms (see the GoFundMe Donation Contentful component),
 * the SDK shows a donation reminder that follows visitors between pages.
 */
const GoFundMeLoader = ({brand}: {brand: Brand}) => {
  if (brand !== Brand.CODE_DOT_ORG) {
    return null;
  }

  return <Script src={GOFUNDME_SDK_SRC} strategy={'beforeInteractive'} />;
};

export default GoFundMeLoader;
