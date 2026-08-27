import {Experience} from '@contentful/experiences-sdk-react';
import {Metadata} from 'next';

import {Brand} from '@/config/brand';
import {getProductionCanonicalRootDomain} from '@/config/host';
import {BRAND_OPENGRAPH_DEFAULT_IMAGE_URL} from '@/config/metadata/opengraph';
import {resolveSeoFields, ResolvedSeoFields} from '@/metadata/resolveSeoFields';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';

export function getSeoMetadata(
  experience: Experience | undefined,
  brand: Brand | undefined,
  locale: string,
  slug: string,
): Metadata {
  const seo = resolveSeoFields(experience);

  return {
    ...(seo.title ? {title: seo.title} : undefined),
    description: seo.description,
    ...(seo.keywords?.length ? {keywords: seo.keywords} : undefined),
    alternates: {
      canonical: getCanonicalUrl(brand, locale, slug),
    },
    openGraph: getOpenGraph(seo, brand, locale),
    robots: {
      index: !seo.noIndex,
      follow: !seo.noFollow,
    },
  };
}

// The site serves paths without a trailing slash, so the home page canonical
// must be `/{locale}`, not `/{locale}/`.
function getCanonicalUrl(
  brand: Brand | undefined,
  locale: string,
  slug: string,
) {
  const path = [locale, ...slug.split('/').filter(Boolean)].join('/');

  return `https://${getProductionCanonicalRootDomain(brand)}/${path}`;
}

function getOpenGraph(
  seo: ResolvedSeoFields,
  brand: Brand | undefined,
  locale: string,
) {
  // As of July 2025, all open graph providers support JPEG & PNG but there is
  // only partial support for AVIF. Use webp for compatibility.
  const opengraphImageUrl = getAbsoluteImageUrl(seo.ogImage, {fm: 'webp'});

  return {
    type: 'website',
    locale,
    title: seo.ogTitle,
    description: seo.ogDescription,
    url: './',
    images:
      seo.ogImage && opengraphImageUrl
        ? opengraphImageUrl
        : brand
          ? BRAND_OPENGRAPH_DEFAULT_IMAGE_URL[brand]
          : undefined,
  };
}
