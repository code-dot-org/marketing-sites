import {create, insertMultiple, Orama} from '@orama/orama';

import {ActivitySchema} from '@/modules/activityCatalog/orama/schema/ActivitySchema';
import {
  Activity,
  OramaActivity,
  OramaEnum,
} from '@/modules/activityCatalog/types/Activity';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {Entry} from '@/types/contentful/Entry';

// Ensure unsorted activities appear at the end
const FEATURED_POSITION_MAX = 999999;

/**
 * Stringifies a link entry for the cards, which only read its fields. The
 * entry's sys and metadata would only add page weight.
 */
function stringifyLink(link: unknown) {
  const fields = (link as {fields?: unknown} | undefined)?.fields;

  return JSON.stringify(fields === undefined ? link : {fields});
}

/**
 * Maps Contentful activity entries to the documents the catalog searches. The
 * server sends these to the client instead of the entries, which carry far
 * more data than the catalog uses.
 * @param activities - An array of Contentful activity entries.
 * @returns One Orama document per activity.
 */
export function toOramaActivities(
  activities: Entry<Activity>[],
): OramaActivity[] {
  return activities.map(activity => {
    const fields = activity.fields;

    // Featured activities have a lower number and are sorted first
    // Non-featured activities get a high number (999) to sort them last
    const prefix = fields.featuredPosition
      ? String(fields.featuredPosition).padStart(3, '0')
      : FEATURED_POSITION_MAX;

    const sortKey = prefix + fields.title;

    return {
      sortKey,
      title: fields.title || '',
      image: getAbsoluteImageUrl(fields.image) || '',
      organization: new Array(fields.organization) as unknown as OramaEnum,
      ages: fields.ages || [],
      languageProgramming: fields.languageProgramming || [],
      shortDescription: fields.shortDescription || '',
      technologyClassroom: fields.technologyClassroom || [],
      topic: fields.topic || [],
      activityType: fields.activityType || [],
      length: fields.length || [],
      accessibilitys: fields.accessibilitys || [],
      languagesText: fields.languagesText || '',
      supportedLanguages: fields.supportedLanguages || [],
      tutorialID: fields.tutorialID || '',
      // This is passed as a stringified JSON to allow the entry to be passed directly into the ActivityCollection component
      // It will be deserialized there
      primaryLinkRef: stringifyLink(fields.primaryLinkRef),
      secondaryLinkRef: fields.secondaryLinkRef
        ? stringifyLink(fields.secondaryLinkRef)
        : undefined,
      featuredPosition: fields.featuredPosition || FEATURED_POSITION_MAX,
    };
  });
}

/**
 * Creates an Orama database from catalog documents.
 * @param activities - Documents from toOramaActivities.
 * @returns An Orama database instance populated with the provided activities.
 */
export function createDatabase(
  activities: OramaActivity[],
): Orama<typeof ActivitySchema> {
  const db = create({schema: ActivitySchema});

  insertMultiple(db, activities);

  return db;
}
