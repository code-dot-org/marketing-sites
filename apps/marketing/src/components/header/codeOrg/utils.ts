import {isExternalLink} from '@/components/common/utils';
import {Brand} from '@/config/brand';
import {getStage} from '@/config/stage';

/** target/rel attributes for a header link; external URLs open a new tab. */
export function getExternalLinkProps(href: string) {
  return isExternalLink(href, Brand.CODE_DOT_ORG, getStage())
    ? {target: '_blank', rel: 'noopener noreferrer'}
    : {};
}
