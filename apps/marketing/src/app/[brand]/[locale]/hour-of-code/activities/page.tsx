import {Metadata} from 'next';
import {notFound} from 'next/navigation';

import {Brand} from '@/config/brand';
import {HourOfAiCatalogPage} from '@/modules/activityCatalog/hourOfAi/catalogPage';
import {buildCatalogMetadata} from '@/modules/activityCatalog/hourOfAi/metadata';
import {ActivityType} from '@/modules/activityCatalog/types/Activity';

export const revalidate = 3600;

const ACTIVITY_TYPE = ActivityType.HOUR_OF_CODE;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale = 'en-US'} = await params;

  return buildCatalogMetadata({locale, activityType: ACTIVITY_TYPE});
}

/**
 * The Hour of Code catalog, hosted alongside the Hour of AI catalog on hourofai.org.
 */
export default async function HourOfCodeActivitiesPage({
  params,
}: {
  params: Promise<{brand: string}>;
}) {
  const {brand} = await params;

  if (brand !== Brand.HOUR_OF_AI) {
    return notFound();
  }

  return <HourOfAiCatalogPage activityType={ACTIVITY_TYPE} />;
}
