import {HTMLAttributes} from 'react';

import {LinkButtonProps} from '@/button';
import {ImageProps} from '@/image';
import {VideoProps} from '@/video';

export interface ActionBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Action Block title */
  title?: string;
  /** Action Block description */
  description?: string;
  /** Action Block image */
  image?: ImageProps;
  /** ActionBlock video */
  video?: VideoProps;
  /** Action Block overline */
  overline?: string;
  /** Action Block tag */
  tag?: string;
  /** Action Block Details */
  details?: {
    /** Detail label */
    label: string;
    /** Detail text */
    description: string;
  };
  /** Primary button props */
  primaryButton?: LinkButtonProps;
  /** Secondary button props */
  secondaryButton?: LinkButtonProps;
  /** Action Block background */
  background?: 'primary' | 'secondary';
  /** Action Block custom className */
  className?: string;
}
