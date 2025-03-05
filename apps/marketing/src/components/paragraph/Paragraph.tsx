import '@code-dot-org/component-library/typography/index.css';
import {
  default as Typography,
  StrongText,
  VisualAppearance,
} from '@code-dot-org/component-library/typography';
import React, {ReactNode} from 'react';
import classNames from 'classnames';

import {WithRemoveMarginBottomProp} from '@/components/common/types';

import moduleStyles from './paragraph.module.scss';

type ParagraphVisualAppearance = Extract<
  VisualAppearance,
  'body-one' | 'body-two' | 'body-three' | 'body-four'
>;

type ParagraphProps = WithRemoveMarginBottomProp<{
  /** Paragraph content */
  children: ReactNode;
  /** Paragraph visual appearance */
  visualAppearance: ParagraphVisualAppearance;
  /** Whether the paragraph text is strong */
  isStrong: boolean;
  /** Paragraph color */
  color: 'primary' | 'secondary';
  /** ClassName passed by contentful to apply styles that are set through contentful native editor*/
  className?: string;
}>;

const Paragraph: React.FunctionComponent<ParagraphProps> = ({
  visualAppearance,
  isStrong,
  color,
  children,
  removeMarginBottom,
  className,
}) => (
  <Typography
    semanticTag="p"
    visualAppearance={visualAppearance}
    className={classNames(
      moduleStyles.paragraph,
      moduleStyles[`paragraph-color-${color}`],
      removeMarginBottom && moduleStyles['paragraph-removeMarginBottom'],
      className,
    )}
  >
    {isStrong ? <StrongText>{children}</StrongText> : children}
  </Typography>
);

export default Paragraph;
