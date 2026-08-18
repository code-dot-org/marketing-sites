import {Experience} from '@contentful/experiences-sdk-react';

import {
  getMetaDescFromExperience,
  getMetaTitleFromExperience,
  getNoIndexFromExperience,
  getOpengraphImageFromExperience,
} from '@/selectors/contentful/getExperienceEntryFields';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export type ResolvedSeoFields = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: ExperienceAsset;
  noIndex: boolean;
  noFollow: boolean;
};

/**
 * Resolves the SEO fields stored flat on the experience entry
 * (metaTitle/metaDesc/opengraphImage/noIndex).
 */
export function resolveSeoFields(
  experience: Experience | undefined,
): ResolvedSeoFields {
  const metaTitle = getMetaTitleFromExperience(experience);
  const metaDesc = getMetaDescFromExperience(experience);
  const noIndex = getNoIndexFromExperience(experience) ?? false;

  return {
    title: metaTitle,
    description: metaDesc,
    ogTitle: metaTitle,
    ogDescription: metaDesc,
    ogImage: getOpengraphImageFromExperience(experience),
    noIndex,
    noFollow: noIndex,
  };
}
