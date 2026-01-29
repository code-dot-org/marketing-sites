import {Icon} from 'next/dist/lib/metadata/types/metadata-types';

import {Brand} from '@/config/brand';

import CDOFavIcon from './favicons/code.org.ico';
import CSForAllFavIcon from './favicons/csforall.ico';
import HOCFavIcon from './favicons/hourofcode.ico';

function getFavIconImage(brand: Brand) {
  switch (brand) {
    case Brand.CODE_DOT_ORG:
      return CDOFavIcon;
    case Brand.HOUR_OF_CODE:
      return HOCFavIcon;
    case Brand.CS_FOR_ALL:
      return CSForAllFavIcon;
  }
}

export function getIcons(brand: Brand): Array<Icon> {
  const favIcon = getFavIconImage(brand);

  return [
    {
      url: favIcon.src,
      href: favIcon.src,
    },
  ];
}
