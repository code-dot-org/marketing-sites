import {getHeaderContent} from '../codeOrg/getHeaderContent';

import {DEFAULT_HEADER_CONTENT} from './config';
import HeaderHourOfAiView from './HeaderHourOfAiView';

/**
 * Hour of AI header. Reuses the Code.org header's CMS fetch, which reads the
 * `siteHeader` singleton from the deployment's own Contentful space.
 */
const HeaderHourOfAi = async () => {
  const result = await getHeaderContent();

  const content =
    result.status === 'ok' ? result.content : DEFAULT_HEADER_CONTENT;
  return <HeaderHourOfAiView content={content} />;
};

export default HeaderHourOfAi;
