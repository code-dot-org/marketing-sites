import {DEFAULT_HEADER_CONTENT} from './config';
import {getHeaderContent} from './getHeaderContent';
import HeaderCodeOrgView from './HeaderCodeOrgView';

const HeaderCodeOrg = async () => {
  const result = await getHeaderContent();

  const content =
    result.status === 'ok' ? result.content : DEFAULT_HEADER_CONTENT;
  return <HeaderCodeOrgView content={content} />;
};

export default HeaderCodeOrg;
