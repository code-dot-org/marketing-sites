import {ExperienceFields} from '@contentful/experiences-core/types';
import {Experience} from '@contentful/experiences-sdk-react';

import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

// The SDK's ExperienceFields type only covers system fields. Our Contentful
// model adds these top-level custom fields to the experience entry. Declaration
// merging won't work here because ExperienceFields is a type alias, not an
// interface — so we intersect at the selector boundary instead.
type ExperienceFieldsWithCustomEntries = ExperienceFields & {
  metaTitle?: string;
  metaDesc?: string;
  opengraphImage?: ExperienceAsset;
  noIndex?: boolean;
};

export function getExperienceEntryFieldsFromExperience(
  experience: Experience | undefined,
) {
  return experience?.entityStore?.experienceEntryFields as
    | ExperienceFieldsWithCustomEntries
    | undefined;
}

export function getMetaTitleFromExperience(experience: Experience | undefined) {
  return getExperienceEntryFieldsFromExperience(experience)?.metaTitle;
}

export function getMetaDescFromExperience(experience: Experience | undefined) {
  return getExperienceEntryFieldsFromExperience(experience)?.metaDesc;
}

export function getOpengraphImageFromExperience(
  experience: Experience | undefined,
) {
  return getExperienceEntryFieldsFromExperience(experience)?.opengraphImage;
}

export function getNoIndexFromExperience(experience: Experience | undefined) {
  return getExperienceEntryFieldsFromExperience(experience)?.noIndex;
}
