import {GlobalFooterProps} from '../common/types';

import {DEFAULT_FOOTER_CONTENT} from './config';
import FooterCodeOrgView from './FooterCodeOrgView';
import {getFooterContent} from './getFooterContent';

const FooterCodeOrg = async ({locale}: GlobalFooterProps) => {
  const content = (await getFooterContent()) ?? DEFAULT_FOOTER_CONTENT;
  return <FooterCodeOrgView locale={locale} content={content} />;
};

export default FooterCodeOrg;
