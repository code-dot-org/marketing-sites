'use client';

import {useSearchParams} from 'next/navigation';

import ActivitiesHero from '@/components/contentful/activityCatalog/activitiesHero';
import {
  CATALOG_SEARCH_PARAM,
  parseCatalog,
} from '@/modules/activityCatalog/hourOfAi/paths';

/**
 * The catalog hero for the catalog filter in the URL. Render it in a Suspense
 * whose fallback is the all-activities hero, so the page's h1 stays in the
 * server HTML.
 */
export default function CatalogHero() {
  const searchParams = useSearchParams();

  return (
    <ActivitiesHero
      activityType={parseCatalog(searchParams.get(CATALOG_SEARCH_PARAM))}
      hourOfAi
    />
  );
}
