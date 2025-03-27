import classNames from 'classnames';
import {CSSProperties, ImgHTMLAttributes} from 'react';

import moduleStyles from './image.module.scss';

export interface ImageProps extends ImgHTMLAttributes<HTMLElement> {
  /** Image source */
  src: string;
  /** Image alt text */
  altText?: string;
  /** Image loading attribute */
  loading?: 'eager' | 'lazy';
  /** Image decoration */
  decoration?: 'none' | 'border' | 'shadow';
  /** Image container width. You can either pass it as a prop, or use custom className to set the needed width value.
   * Using custom className is recommended, but we also support setting it via prop for the cases when it might be
   * impossible to use custom className. */
  width?: string | number;
  /** Image container height. You can either pass it as a prop, or use custom className to set the needed height value.
   Using custom className is recommended, but we also support setting it via prop for the cases when it might be
   impossible to use custom className. */
  height?: string | number;
  /** Optional inline styles. You can either pass it as a prop, or use custom className to set the needed styles values.
   Using custom className is recommended, but we also support setting it via prop for the cases when it might be
   impossible to use custom className. */
  style?: CSSProperties;
  /** Custom className */
  className?: string;
  /** Image onLoad callback */
  onLoad?: () => void;
  /** Image onError callback */
  onError?: () => void;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Image Component.
 * Renders an image inside a fixed-size container while maintaining aspect ratio.
 * Supports DSCO common decorative options for border and box shadow.
 */
const Image: React.FC<ImageProps> = ({
  src,
  altText = '',
  loading = 'lazy',
  decoration = 'none',
  width,
  height,
  style,
  className,
  onLoad,
  onError,
  ...imgProps
}) => {
  // Only use inline styles if there's no way to add custom className with needed styles.
  const containerStyles: CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <figure
      className={classNames(
        moduleStyles.figureContainer,
        {
          [moduleStyles['figure-hasBorder']]: decoration === 'border',
          [moduleStyles['figure-hasBoxShadow']]: decoration === 'shadow',
        },
        className,
      )}
      style={containerStyles}
    >
      <img
        className={classNames(moduleStyles.image)}
        alt={altText}
        loading={loading}
        src={src}
        onLoad={onLoad}
        onError={onError}
        {...imgProps}
      />
    </figure>
  );
};

export default Image;
