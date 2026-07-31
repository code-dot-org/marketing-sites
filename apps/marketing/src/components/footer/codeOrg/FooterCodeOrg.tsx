import {GlobalFooterProps} from '../common/types';
import FooterCorporateSite from '../corporateSite';

import {DEFAULT_FOOTER_CONTENT} from './config';
import FooterCodeOrgView from './FooterCodeOrgView';
import {getFooterContent} from './getFooterContent';

const FooterCodeOrg = async ({locale}: GlobalFooterProps) => {
  const result = await getFooterContent();

  // LEGACY-ENV-COMPAT: the old production environment has no siteFooter
  // content type — render the current-production footer until the Contentful
  // environment switch. Remove with the 'legacy-environment' result arm.
  if (result.status === 'legacy-environment') {
    return <FooterCorporateSite locale={locale} />;
  }

  const content =
    result.status === 'ok' ? result.content : DEFAULT_FOOTER_CONTENT;
  return <FooterCodeOrgView locale={locale} content={content} />;
};

export default FooterCodeOrg;
