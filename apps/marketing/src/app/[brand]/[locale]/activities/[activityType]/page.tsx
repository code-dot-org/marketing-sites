import {Metadata} from 'next';
import {notFound} from 'next/navigation';

import {Brand} from '@/config/brand';
import {ActivityCatalogPage} from '@/modules/activityCatalog/page/activityCatalogPage';
import {buildActivityCatalogMetadata} from '@/modules/activityCatalog/page/metadata';
import {
  ActivityType,
  ValidActivityTypes,
} from '@/modules/activityCatalog/types/Activity';

export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; activityType: string}>;
}): Promise<Metadata> {
  const {locale = 'en-US', activityType} = await params;

  return buildActivityCatalogMetadata({
    brand: Brand.CS_FOR_ALL,
    locale,
    activityType: activityType as ActivityType,
  });
}

/**
 * CSFORALL-COMPAT: csforall.org serves the catalog at
 * `/activities/{activityType}` until retirement; the Code.org brand uses the
 * static `/{activityType}/activities` routes instead.
 */
export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{brand: string; locale: string; activityType: string}>;
}) {
  const {brand, activityType} = await params;

  if (
    brand !== Brand.CS_FOR_ALL ||
    !ValidActivityTypes.has(activityType as ActivityType)
  ) {
    return notFound();
  }

  return (
    <ActivityCatalogPage
      brand={Brand.CS_FOR_ALL}
      activityType={activityType as ActivityType}
    />
  );
}
