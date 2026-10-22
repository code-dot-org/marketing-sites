import {Metadata} from 'next';
import {notFound} from 'next/navigation';

import {Brand} from '@/config/brand';
import {HourOfAiCatalogPage} from '@/modules/activityCatalog/hourOfAi/catalogPage';
import {buildCatalogMetadata} from '@/modules/activityCatalog/hourOfAi/metadata';

export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale = 'en-US'} = await params;

  return buildCatalogMetadata({locale});
}

/**
 * The Hour of AI and Hour of Code catalog, served at the bare /activities on
 * hourofai.org.
 */
export default async function HourOfAiActivitiesPage({
  params,
}: {
  params: Promise<{brand: string}>;
}) {
  const {brand} = await params;

  if (brand !== Brand.HOUR_OF_AI) {
    return notFound();
  }

  return <HourOfAiCatalogPage />;
}
