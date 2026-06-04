import {Experience} from '@contentful/experiences-sdk-react';
import {Metadata} from 'next';

import {Brand} from '@/config/brand';
import {getProductionCanonicalRootDomain} from '@/config/host';
import {BRAND_OPENGRAPH_DEFAULT_IMAGE_URL} from '@/config/metadata/opengraph';
import {
  getMetaDescFromExperience,
  getMetaTitleFromExperience,
  getNoIndexFromExperience,
  getOpengraphImageFromExperience,
} from '@/selectors/contentful/getExperienceEntryFields';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export function getSeoMetadata(
  experience: Experience | undefined,
  brand: Brand | undefined,
  locale: string,
  slug: string,
): Metadata {
  const metaTitle = getMetaTitleFromExperience(experience);
  const metaDesc = getMetaDescFromExperience(experience);
  const opengraphImage = getOpengraphImageFromExperience(experience);
  const noIndex = getNoIndexFromExperience(experience) ?? false;

  return {
    ...(metaTitle ? {title: metaTitle} : undefined),
    description: metaDesc,
    alternates: {
      canonical: `https://${getProductionCanonicalRootDomain(brand)}/${locale}/${slug}`,
    },
    openGraph: getOpenGraph(metaTitle, metaDesc, opengraphImage, brand, locale),
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}

function getOpenGraph(
  metaTitle: string | undefined,
  metaDesc: string | undefined,
  opengraphImage: ExperienceAsset | undefined,
  brand: Brand | undefined,
  locale: string,
) {
  // As of July 2025, all open graph providers support JPEG & PNG but there is
  // only partial support for AVIF. Use webp for compatibility.
  const opengraphImageUrl = getAbsoluteImageUrl(opengraphImage, {fm: 'webp'});

  return {
    type: 'website',
    locale,
    title: metaTitle,
    description: metaDesc,
    url: './',
    images:
      opengraphImage && opengraphImageUrl
        ? opengraphImageUrl
        : brand
          ? BRAND_OPENGRAPH_DEFAULT_IMAGE_URL[brand]
          : undefined,
  };
}
