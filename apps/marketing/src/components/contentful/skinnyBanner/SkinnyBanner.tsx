import React from 'react';

import DSCOSkinnyBanner from '@code-dot-org/component-library/cms/skinnyBanner';
import {Theme} from '@code-dot-org/component-library/common/contexts';

import {externalLinkIconProps} from '@/components/common/constants';
import {LinkEntry} from '@/types/contentful/entries/Link';

type SkinnyBannerProps = {
  /** HeroBanner content mode (theme) value */
  contentMode: Theme;
  /** HeroBanner cf styles*/
  className?: string;
  /** HeroBanner heading */
  heading: string;
  /** HeroBanner description */
  description?: string;
  /** Section Image URL */
  sectionImage?: string;
  /** Hero Banner Button Link Entry **/
  buttonLink?: LinkEntry;
  /** HeroBanner partner image URL */
  partnerLogo?: string;
  /** HeroBanner partner callout (title) */
  partnerCallout?: string;
  /** HeroBanner background image URL */
  backgroundImage?: string;
};

const SkinnyBanner: React.FunctionComponent<SkinnyBannerProps> = ({
  // Style Props
  contentMode,
  className,
  // Content Props
  heading,
  description,
  sectionImage,
  buttonLink,
  partnerLogo,
  partnerCallout,
  backgroundImage,
}) => (
  <DSCOSkinnyBanner
    data-theme={contentMode}
    className={className}
    heading={heading}
    description={description}
    imageProps={sectionImage ? {src: sectionImage} : undefined}
    buttonProps={
      buttonLink
        ? {
            text: buttonLink.fields.label,
            href: buttonLink.fields.primaryTarget,
            ariaLabel: buttonLink.fields.ariaLabel,
            iconRight: buttonLink.fields.isThisAnExternalLink
              ? externalLinkIconProps
              : undefined,
          }
        : undefined
    }
    partner={
      partnerLogo && partnerCallout
        ? {title: partnerCallout, logo: {src: partnerLogo}}
        : undefined
    }
    backgroundImageUrl={backgroundImage}
  />
);

export default SkinnyBanner;
