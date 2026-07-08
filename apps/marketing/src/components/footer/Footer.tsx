import {Brand} from '@/config/brand';
import {SupportedLocale} from '@/config/locale';

import FooterCodeOrg from './codeOrg';
import FooterCSforAll from './csForAll';

export const getFooter = async (brand: Brand, locale: SupportedLocale) => {
  switch (brand) {
    case Brand.CS_FOR_ALL:
      return <FooterCSforAll locale={locale} />;
    case Brand.CODE_DOT_ORG:
      return <FooterCodeOrg locale={locale} />;
  }
};
