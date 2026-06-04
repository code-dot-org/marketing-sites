import {ExperienceFields} from '@contentful/experiences-core/types';
import {Experience} from '@contentful/experiences-sdk-react';

import {SeoMetadataEntry} from '@/types/contentful/entries/SeoMetadata';

// The SDK's ExperienceFields type only covers system fields. Our Contentful
// model adds these top-level custom fields to the experience entry. Declaration
// merging won't work here because ExperienceFields is a type alias, not an
// interface — so we intersect at the selector boundary instead.
type ExperienceFieldsWithCustomEntries = ExperienceFields & {
  seoMetadata?: SeoMetadataEntry;
  pageHeading?: string;
};

export function getExperienceEntryFieldsFromExperience(
  experience: Experience | undefined,
) {
  return experience?.entityStore?.experienceEntryFields as
    | ExperienceFieldsWithCustomEntries
    | undefined;
}

export function getSeoMetadataEntryFromExperience(
  experience: Experience | undefined,
) {
  return getExperienceEntryFieldsFromExperience(experience)?.seoMetadata;
}

export function getSeoMetadataFromExperience(
  experience: Experience | undefined,
) {
  return getSeoMetadataEntryFromExperience(experience)?.fields;
}

export function getPageHeading(experience: Experience | undefined) {
  return getExperienceEntryFieldsFromExperience(experience)?.pageHeading;
}
