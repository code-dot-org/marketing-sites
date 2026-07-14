import {DEFAULT_HEADER_CONTENT} from './config';
import {getHeaderContent} from './getHeaderContent';
import HeaderCodeOrgView from './HeaderCodeOrgView';

const HeaderCodeOrg = async () => {
  const content = (await getHeaderContent()) ?? DEFAULT_HEADER_CONTENT;
  return <HeaderCodeOrgView content={content} />;
};

export default HeaderCodeOrg;
