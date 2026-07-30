import {Experience} from '@contentful/experiences-sdk-react';

import {
  getExperienceEntryFieldsFromExperience,
  getLegacySeoMetadataFromExperience,
  getMetaDescFromExperience,
  getMetaTitleFromExperience,
  getNoIndexFromExperience,
  getOpengraphImageFromExperience,
  getPageHeadingFromExperience,
} from '@/selectors/contentful/getExperienceEntryFields';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export type ResolvedSeoFields = {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: ExperienceAsset;
  noIndex: boolean;
  noFollow: boolean;
};

/**
 * Normalizes the two SEO content shapes to one set of fields.
 *
 * The new content model stores SEO fields flat on the experience entry
 * (metaTitle/metaDesc/opengraphImage/noIndex). LEGACY-ENV-COMPAT: the old
 * production environment instead has pageHeading and a linked seoMetadata
 * entry — the field sets are mutually exclusive per environment, so shape
 * detection cannot misfire. Remove the legacy branch when the production
 * Contentful environment serves the new content model.
 */
export function resolveSeoFields(
  experience: Experience | undefined,
): ResolvedSeoFields {
  // LEGACY-ENV-COMPAT: start
  const legacySeo = getLegacySeoMetadataFromExperience(experience);
  const pageHeading = getPageHeadingFromExperience(experience);
  const hasLegacyShape =
    legacySeo !== undefined ||
    pageHeading !== undefined ||
    getExperienceEntryFieldsFromExperience(experience)?.seoMetadata !==
      undefined;

  if (hasLegacyShape) {
    return {
      title: legacySeo?.seoTitle ?? pageHeading,
      description: legacySeo?.seoDescription,
      keywords: legacySeo?.keywords,
      ogTitle: legacySeo?.openGraphTitle,
      ogDescription: legacySeo?.openGraphDescription,
      ogImage: legacySeo?.openGraphImage,
      noIndex: legacySeo?.hidePageFromSearchEnginesNoindex ?? false,
      noFollow: legacySeo?.hideLinksFromSearchEnginesNofollow ?? false,
    };
  }
  // LEGACY-ENV-COMPAT: end

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
