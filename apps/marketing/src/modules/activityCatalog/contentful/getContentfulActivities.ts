import {draftMode} from 'next/headers';

import {Brand} from '@/config/brand';
import {getContentfulClient} from '@/contentful/client';
import {isUnknownContentTypeError} from '@/contentful/errors';
import {getAllEntriesForContentType} from '@/contentful/get-entries';
import {Activity} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

/**
 * Retrieves all activities from Contentful.
 * @param activityType The type of activities to retrieve (e.g., 'hour-of-ai', 'hour-of-code').
 * @param brand The brand whose space holds the activities.
 * @returns A promise that resolves to an array of activity entries.
 */
export async function getContentfulActivities(
  activityType: string,
  brand: Brand,
) {
  const isDraftModeEnabled = (await draftMode()).isEnabled;
  const contentfulClient = getContentfulClient(isDraftModeEnabled);

  if (!contentfulClient) {
    console.warn(
      '⚠️ Contentful client is not available. Please check that frontend/apps/marketing/.env is populated.',
    );
    return [];
  }

  // CSFORALL-COMPAT: the CSforAll space models activities on its old-model
  // 'curriculum' type; the Code.org space uses the dedicated 'activity' type.
  const contentTypeId = brand === Brand.CS_FOR_ALL ? 'curriculum' : 'activity';

  console.log('Fetching activities for activityType:', activityType);
  try {
    return await getAllEntriesForContentType<Entry<Activity>>(
      contentfulClient,
      contentTypeId,
      {'metadata.tags.sys.id[in]': [activityType]},
    );
  } catch (error) {
    // An environment without the content type must render an empty catalog,
    // not a 500 (the CDA rejects queries on unknown content types).
    if (isUnknownContentTypeError(error)) {
      console.warn(
        `⚠️ Content type '${contentTypeId}' does not exist in the configured Contentful environment; rendering an empty activity catalog.`,
      );
      return [];
    }

    throw error;
  }
}
