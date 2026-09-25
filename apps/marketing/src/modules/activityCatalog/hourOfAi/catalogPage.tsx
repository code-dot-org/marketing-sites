import {Results, search} from '@orama/orama';
import {Suspense} from 'react';

import ActivityCatalog from '@/components/contentful/activityCatalog';
import ActivitiesHero from '@/components/contentful/activityCatalog/activitiesHero';
import {getContentfulActivities} from '@/modules/activityCatalog/contentful/getContentfulActivities';
import CatalogCrossLink from '@/modules/activityCatalog/hourOfAi/crossLink';
import {createDatabase} from '@/modules/activityCatalog/orama/createDatabase';
import {Activity, ActivityType} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

/**
 * The catalog page served on hourofai.org, for both Hour of AI and Hour of
 * Code. Fetches activities, builds an Orama database and hands serialized data
 * to the client-side catalog.
 */
export async function HourOfAiCatalogPage({
  activityType,
}: {
  activityType: ActivityType;
}) {
  const contentfulActivities = (await getContentfulActivities(
    activityType,
    'activity',
  )) as unknown as Entry<Activity>[];

  const db = createDatabase(contentfulActivities);

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
      <ActivitiesHero activityType={activityType} hourOfAi />
      <Suspense>
        <ActivityCatalog
          contentfulActivities={contentfulActivities}
          activities={await getAllActivities()}
          facets={await getSearchFacets()}
          hourOfAi
        />
      </Suspense>
      <CatalogCrossLink activityType={activityType} />
    </main>
  );
}
