import {Results, search} from '@orama/orama';
import {Suspense} from 'react';

import ActivityCatalog from '@/components/contentful/activityCatalog';
import ActivitiesFooter from '@/components/contentful/activityCatalog/activitiesFooter';
import ActivitiesHero from '@/components/contentful/activityCatalog/activitiesHero';
import {Brand} from '@/config/brand';
import {getContentfulActivities} from '@/modules/activityCatalog/contentful/getContentfulActivities';
import {createDatabase} from '@/modules/activityCatalog/orama/createDatabase';
import {Activity, ActivityType} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

interface ActivityCatalogPageProps {
  brand: Brand;
  activityType: ActivityType;
}

/**
 * Server-side rendered activity catalog page, shared by every brand's catalog
 * route. Fetches activities from Contentful, creates an Orama database, and
 * passes serialized data to the client-side ActivityCatalog component.
 */
export async function ActivityCatalogPage({
  brand,
  activityType,
}: ActivityCatalogPageProps) {
  // Fetch activities from Contentful
  const contentfulActivities = (await getContentfulActivities(
    activityType,
    brand,
  )) as unknown as Entry<Activity>[];

  // Create Orama database from Contentful activities
  const db = createDatabase(
    contentfulActivities as unknown as Entry<Activity>[],
  );

  /**
   * Finds all unique values for each facet in the Orama database.
   */
  const getSearchFacets = async () => {
    const facetResults: Results<Activity> = await search(db, {
      facets: {
        organization: {},
        ages: {},
        topic: {},
        activityType: {},
        languageProgramming: {},
        length: {},
        accessibilitys: {},
        technologyClassroom: {},
        supportedLanguages: {},
      },
      limit: 100,
    });

    return facetResults.facets;
  };

  /**
   * Fetches all activities from the Orama database.
   */
  const getAllActivities = async () => {
    const allActivityResults = await search(db, {
      term: '',
      limit: 8,
      sortBy: {property: 'sortKey', order: 'ASC'},
    });

    return allActivityResults.hits.map(hit => hit.document);
  };

  return (
    <main>
      <ActivitiesHero activityType={activityType} />
      <Suspense>
        <ActivityCatalog
          contentfulActivities={contentfulActivities}
          activities={await getAllActivities()}
          facets={await getSearchFacets()}
        />
      </Suspense>
      <ActivitiesFooter brand={brand} activityType={activityType} />
    </main>
  );
}
