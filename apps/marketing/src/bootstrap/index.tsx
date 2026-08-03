'use client';
import FontLoader from '@code-dot-org/fonts/FontLoader';

import {getDashboardLocale, SupportedLocale} from '@/config/locale';

interface BootstrapProps {
  locale: string;
}
const Bootstrap = ({locale}: BootstrapProps) => {
  return <FontLoader locale={getDashboardLocale(locale as SupportedLocale)} />;
};

export default Bootstrap;
