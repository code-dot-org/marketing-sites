import HeaderCorporateSite from '../corporateSite';

import {DEFAULT_HEADER_CONTENT} from './config';
import {getHeaderContent} from './getHeaderContent';
import HeaderCodeOrgView from './HeaderCodeOrgView';

const HeaderCodeOrg = async () => {
  const result = await getHeaderContent();

  // LEGACY-ENV-COMPAT: the old production environment has no siteHeader
  // content type — render the current-production header until the Contentful
  // environment switch. Remove with the 'legacy-environment' result arm.
  if (result.status === 'legacy-environment') {
    return <HeaderCorporateSite />;
  }

  const content =
    result.status === 'ok' ? result.content : DEFAULT_HEADER_CONTENT;
  return <HeaderCodeOrgView content={content} />;
};

export default HeaderCodeOrg;
