import classNames from 'classnames';
import {ReactNode, HTMLAttributes} from 'react';

import {LinkButton, LinkButtonProps} from '@/button';
import {Theme} from '@/common/contexts';
import Image, {ImageProps} from '@/image';
import {Heading5, BodyTwoText} from '@/typography';

import moduleStyles from './skinnyBanner.module.scss';

export interface SkinnyBannerProps extends HTMLAttributes<HTMLElement> {
  /** HeroBanner heading */
  heading: string | ReactNode;
  /** HeroBanner description */
  description?: string | ReactNode;
  /** HeroBanner image */
  imageProps?: ImageProps;
  /** HeroBanner link */
  buttonProps?: LinkButtonProps;
  /** HeroBanner custom background color.
   *  backgroundImageUrl is higher priority then backgroundColor. */
  backgroundColor?: string;
  /** HeroBanner custom background url */
  backgroundImageUrl?: string;
  /** HeroBanner theme value.
   *  If you're using backgroundImageUrl - you should make sure you set correct theme value to HeroBanner.
   *  */
  'data-theme'?: Theme;
  /** Whether to show the background color */
  removeBackground?: boolean;
  /** HeroBanner partner prop */
  partner?: {title: string; logo: ImageProps};
  /** HeroBanner custom className  */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/HeroBanner.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: SkinnyBanner Component.
 * Renders a Hero Banner/Section which serves as an opening section of a page. There should only be one Hero Banner
 * per page at the very top of the page under the header navigation.
 */
const SkinnyBanner: React.FC<SkinnyBannerProps> = ({
  heading,
  description,
  partner,
  imageProps,
  buttonProps,
  backgroundColor,
  backgroundImageUrl,
  removeBackground = false,
  className,
  ...HTMLAttributes
}) => (
  <div
    role="banner"
    className={classNames(moduleStyles.skinnyBannerWrapper, className)}
    data-theme={HTMLAttributes['data-theme']}
    {...HTMLAttributes}
    style={{
      ...(HTMLAttributes.style ?? {}),
      backgroundColor: backgroundColor
        ? backgroundColor
        : HTMLAttributes.style?.backgroundColor,
      backgroundImage: backgroundImageUrl
        ? `url(${backgroundImageUrl})`
        : HTMLAttributes.style?.backgroundImage,
      ...(removeBackground ? {background: 'none'} : {}),
    }}
  >
    <div className={classNames(moduleStyles.skinnyBannerContainer)}>
      <div className={moduleStyles.skinnyBannerTextContainer}>
        <Heading5>{heading}</Heading5>

        {description && <BodyTwoText>{description}</BodyTwoText>}

        {partner && (
          <span className={moduleStyles.skinnyBannerPartnerContainer}>
            {partner.title}
            <Image {...partner.logo} />
          </span>
        )}
      </div>

      {imageProps && (
        <div className={moduleStyles.skinnyBannerMediaContainer}>
          {imageProps && <Image {...imageProps} />}
        </div>
      )}
      {buttonProps && (
        <div className={moduleStyles.skinnyBannerButtonContainer}>
          <LinkButton color="purple" type="primary" {...buttonProps} />
        </div>
      )}
    </div>
  </div>
);

export default SkinnyBanner;
