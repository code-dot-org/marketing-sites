import {Icon} from 'next/dist/lib/metadata/types/metadata-types';

import {Brand} from '@/config/brand';

import CSForAllFavIcon from './favicons/csforall.ico';
import CDOFavIconIco from './favicons/favicon-codeai.ico';
import CDOFavIconSvg from './favicons/favicon-codeai.svg';
import HOCFavIcon from './favicons/hourofcode.ico';

export function getIcons(brand: Brand): Array<Icon> {
  switch (brand) {
    case Brand.CODE_DOT_ORG:
      return [
        {url: CDOFavIconSvg.src, type: 'image/svg+xml'},
        {url: CDOFavIconIco.src, type: 'image/x-icon', sizes: '32x32'},
      ];
    case Brand.HOUR_OF_CODE:
      return [{url: HOCFavIcon.src}];
    case Brand.CS_FOR_ALL:
      return [{url: CSForAllFavIcon.src}];
  }
}
