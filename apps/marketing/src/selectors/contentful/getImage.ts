import {updateUrlParams} from '@/components/common/helpers';
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
    const relativeImageUrl = getRelativeImageUrl(asset);
    absoluteImageUrl = relativeImageUrl
      ? `https:${relativeImageUrl}`
      : undefined;
  }

  if (!absoluteImageUrl) return undefined;

  try {
    // Force AVIF format conversion for the image
    return updateUrlParams(absoluteImageUrl, {fm: 'avif'});
  } catch (e) {
    console.error(e);
    return absoluteImageUrl;
  }
}
