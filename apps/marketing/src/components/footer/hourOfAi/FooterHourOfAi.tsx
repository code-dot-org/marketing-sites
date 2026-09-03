import {DEFAULT_FOOTER_CONTENT} from '../codeOrg/config';
import FooterCodeOrgView from '../codeOrg/FooterCodeOrgView';
import {getFooterContent} from '../codeOrg/getFooterContent';
import {GlobalFooterProps} from '../common/types';

/**
 * Hour of AI footer — scaffolding.
 *
 * Reuses the CMS-driven fetch and view from the Code.org footer, which reads
 * the `siteFooter` singleton from the deployment's own Contentful space. See
 * the note in `header/hourOfAi/HeaderHourOfAi.tsx` about promoting these to
 * `common/` once the Hour of AI design lands.
 */
const FooterHourOfAi = async ({locale}: GlobalFooterProps) => {
  const result = await getFooterContent();

  const content =
    result.status === 'ok' ? result.content : DEFAULT_FOOTER_CONTENT;
  return <FooterCodeOrgView locale={locale} content={content} />;
};

export default FooterHourOfAi;
