import {Brand} from '@/config/brand';
import LocalizeLoader from '@/providers/localize/LocalizeLoader';

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{brand: Brand; locale: string}>;
}>) {
  const syncParams = await params;
  const {brand, locale} = syncParams;

  return (
    <>
      <LocalizeLoader brand={brand} locale={locale} />
      {children}
    </>
  );
}
