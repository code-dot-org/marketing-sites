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
 * (metaTitle/metaDesc/opengraphImage/noIndex). CSFORALL-COMPAT: the CSforAll
 * space still uses the old model's pageHeading and linked seoMetadata entry —
 * the field sets are mutually exclusive per space, so shape detection cannot
 * misfire. Remove the legacy branch when csforall is retired.
 */
// CSFORALL-COMPAT: true when the experience entry carries the old content
// model's shape (pageHeading + linked seoMetadata entry).
export function isLegacyShapeExperience(
  experience: Experience | undefined,
): boolean {
  return (
    getLegacySeoMetadataFromExperience(experience) !== undefined ||
    getPageHeadingFromExperience(experience) !== undefined ||
    getExperienceEntryFieldsFromExperience(experience)?.seoMetadata !==
      undefined
  );
}

export function resolveSeoFields(
  experience: Experience | undefined,
): ResolvedSeoFields {
  // CSFORALL-COMPAT: start
  const legacySeo = getLegacySeoMetadataFromExperience(experience);
  const pageHeading = getPageHeadingFromExperience(experience);

  if (isLegacyShapeExperience(experience)) {
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
  // CSFORALL-COMPAT: end

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
