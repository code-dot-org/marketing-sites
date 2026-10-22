import {Results, search} from '@orama/orama';
import {Suspense} from 'react';

import ActivityCatalog from '@/components/contentful/activityCatalog';
import ActivitiesHero from '@/components/contentful/activityCatalog/activitiesHero';
import {getContentfulActivities} from '@/modules/activityCatalog/contentful/getContentfulActivities';
import CatalogHero from '@/modules/activityCatalog/hourOfAi/catalogHero';
import {
  createDatabase,
  toOramaActivities,
} from '@/modules/activityCatalog/orama/createDatabase';
import {Activity, ActivityType} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

/**
 * The catalog page served on hourofai.org: Hour of AI and Hour of Code
 * activities together, filterable by catalog. Fetches activities, builds an
 * Orama database and hands its documents to the client-side catalog.
 */
export async function HourOfAiCatalogPage() {
  const contentfulActivities = (await getContentfulActivities(
    Object.values(ActivityType),
  )) as unknown as Entry<Activity>[];

  const documents = toOramaActivities(contentfulActivities);
  const db = createDatabase(documents);

  const getSearchFacets = async (catalog?: ActivityType) => {
    const facetResults: Results<Activity> = await search(db, {
      ...(catalog && {where: {catalogs: {containsAny: [catalog]}}}),
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
      {/* The fallback puts the all-activities h1 in the server HTML. */}
      <Suspense fallback={<ActivitiesHero hourOfAi />}>
        <CatalogHero />
      </Suspense>
      <Suspense>
        <ActivityCatalog
          documents={documents}
          activities={await getAllActivities()}
          facets={await getSearchFacets()}
          catalogFacets={{
            [ActivityType.HOUR_OF_AI]: await getSearchFacets(
              ActivityType.HOUR_OF_AI,
            ),
            [ActivityType.HOUR_OF_CODE]: await getSearchFacets(
              ActivityType.HOUR_OF_CODE,
            ),
          }}
          hourOfAi
        />
      </Suspense>
    </main>
  );
}
