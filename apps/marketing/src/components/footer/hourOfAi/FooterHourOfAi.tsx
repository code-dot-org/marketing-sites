import {getFooterContent} from '../codeOrg/getFooterContent';
import {GlobalFooterProps} from '../common/types';

import {DEFAULT_FOOTER_CONTENT} from './config';
import FooterHourOfAiView from './FooterHourOfAiView';

/**
 * Hour of AI footer. Reuses the Code.org footer's CMS fetch, which reads the
 * `siteFooter` singleton from the deployment's own Contentful space; tagline
 * and mission aren't rendered.
 */
const FooterHourOfAi = async ({locale}: GlobalFooterProps) => {
  const result = await getFooterContent();

  const content =
    result.status === 'ok' ? result.content : DEFAULT_FOOTER_CONTENT;
  return <FooterHourOfAiView locale={locale} content={content} />;
};

export default FooterHourOfAi;
