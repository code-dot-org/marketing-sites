import {draftMode} from 'next/headers';

import {getContentfulClient} from '@/contentful/client';
import {getAllEntriesForContentType} from '@/contentful/get-entries';
import {Activity} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

/**
 * Retrieves activities from Contentful.
 * @param activityTypes The catalogs to retrieve (e.g., 'hour-of-ai', 'hour-of-code'). An activity tagged
 * with any of them is returned once; untagged activities are not returned.
 * @returns A promise that resolves to an array of activity entries.
 */
export async function getContentfulActivities(activityTypes: string[]) {
  const isDraftModeEnabled = (await draftMode()).isEnabled;
  const contentfulClient = getContentfulClient(isDraftModeEnabled);

  if (!contentfulClient) {
    console.warn(
      '⚠️ Contentful client is not available. Please check that frontend/apps/marketing/.env is populated.',
    );
    return [];
  }
  console.log('Fetching activities for activityTypes:', activityTypes);
  return getAllEntriesForContentType<Entry<Activity>>(
    contentfulClient,
    'activity',
    {'metadata.tags.sys.id[in]': activityTypes},
  );
}
