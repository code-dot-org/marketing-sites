import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export function getRelativeImageUrl(asset: ExperienceAsset | undefined) {
  return asset?.fields?.file?.url;
}

export function getAbsoluteImageUrl(
  asset: ExperienceAsset | string | undefined,
) {
  const absoluteImageUrl =
    typeof asset === 'string' ? asset : getRelativeImageUrl(asset) || undefined;

  if (!absoluteImageUrl) return undefined;

  try {
    const imgUrl = new URL(
      absoluteImageUrl.startsWith('//')
        ? `https:${absoluteImageUrl}`
        : absoluteImageUrl,
    );
    // Force AVIF format conversion for the image
    imgUrl.searchParams.set('fm', 'avif');
    return imgUrl.toString();
  } catch (e) {
    console.error(e);
    return absoluteImageUrl;
  }
}
