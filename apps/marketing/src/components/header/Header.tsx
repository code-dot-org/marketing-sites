import {Brand} from '@/config/brand';

import HeaderCodeOrg from './codeOrg';
import HeaderCSforAll from './csForAll';

export const getHeader = (brand: Brand) => {
  switch (brand) {
    case Brand.CS_FOR_ALL:
      return <HeaderCSforAll />;
    case Brand.CODE_DOT_ORG:
      return <HeaderCodeOrg />;
  }
};
