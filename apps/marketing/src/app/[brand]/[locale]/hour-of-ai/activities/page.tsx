import {Metadata} from 'next';
import {notFound} from 'next/navigation';

import {Brand} from '@/config/brand';
import {ActivityCatalogPage} from '@/modules/activityCatalog/page/activityCatalogPage';
import {buildActivityCatalogMetadata} from '@/modules/activityCatalog/page/metadata';
import {ActivityType} from '@/modules/activityCatalog/types/Activity';

export const revalidate = 3600;

const ACTIVITY_TYPE = ActivityType.HOUR_OF_AI;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale = 'en-US'} = await params;

  return buildActivityCatalogMetadata({
    brand: Brand.CODE_DOT_ORG,
    locale,
    activityType: ACTIVITY_TYPE,
  });
}

export default async function HourOfAiActivitiesPage({
  params,
}: {
  params: Promise<{brand: string; locale: string}>;
}) {
  const {brand} = await params;

  if (brand !== Brand.CODE_DOT_ORG) {
    return notFound();
  }

  return (
    <ActivityCatalogPage
      brand={Brand.CODE_DOT_ORG}
      activityType={ACTIVITY_TYPE}
    />
  );
}
