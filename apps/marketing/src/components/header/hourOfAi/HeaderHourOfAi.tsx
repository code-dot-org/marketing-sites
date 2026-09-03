import {DEFAULT_HEADER_CONTENT} from '../codeOrg/config';
import {getHeaderContent} from '../codeOrg/getHeaderContent';
import HeaderCodeOrgView from '../codeOrg/HeaderCodeOrgView';

/**
 * Hour of AI header — scaffolding.
 *
 * Reuses the CMS-driven fetch and view from the Code.org header. That fetch
 * takes no brand argument: it reads the `siteHeader` singleton from whichever
 * Contentful space the deployment is configured with, so Hour of AI renders its
 * own navigation without any further wiring.
 *
 * When the Hour of AI design lands, promote `getHeaderContent` and the view to
 * `components/header/common/` rather than deepening this cross-brand import.
 */
const HeaderHourOfAi = async () => {
  const result = await getHeaderContent();

  const content =
    result.status === 'ok' ? result.content : DEFAULT_HEADER_CONTENT;
  return <HeaderCodeOrgView content={content} />;
};

export default HeaderHourOfAi;
