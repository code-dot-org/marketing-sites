import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export function getRelativeImageUrl(asset: ExperienceAsset | undefined) {
  return asset?.fields?.file?.url;
}

export function getAbsoluteImageUrl(
  asset: ExperienceAsset | string | undefined,
) {
  let absoluteImageUrl: string | undefined;

  if (typeof asset === 'string') {
    absoluteImageUrl = asset;
  } else {
    absoluteImageUrl = getRelativeImageUrl(asset) || undefined;
  }

  if (!absoluteImageUrl) return undefined;

  if (absoluteImageUrl.startsWith('//'))
    absoluteImageUrl = `https:${absoluteImageUrl}`;

  try {
    const imgUrl = new URL(absoluteImageUrl);
    // Force AVIF format conversion for the image
    imgUrl.searchParams.set('fm', 'avif');
    return imgUrl.toString();
  } catch (e) {
    console.error(e);
    return absoluteImageUrl;
  }
}
