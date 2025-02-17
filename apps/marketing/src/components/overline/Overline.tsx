import '@code-dot-org/component-library/typography/index.css';
import {
  default as Typography,
  VisualAppearance,
} from '@code-dot-org/component-library/typography';
import {
  ComponentSizeXSToL,
  SpacingNoneToM,
} from '@code-dot-org/component-library/common/types';
import classNames from 'classnames';
import React, {ReactNode} from 'react';

import moduleStyles from './overline.module.scss';

type OverlineVisualAppearance = Extract<
  VisualAppearance,
  'overline-one' | 'overline-two' | 'overline-three'
>;

type OverlineProps = {
  /** Overline content */
  children: ReactNode;
  /** Overline size */
  size: Exclude<ComponentSizeXSToL, 'xs'>;
  /** Overline color */
  color: 'primary' | 'secondary';
  /** Overline margin bottom */
  marginBottom: SpacingNoneToM;
  /** ClassName passed by contentful to apply styles that are set through contentful native editor*/
  className?: string;
};

const overlineSizeToVisualAppearance: Record<
  Exclude<ComponentSizeXSToL, 'xs'>,
  OverlineVisualAppearance
> = {
  s: 'overline-three',
  m: 'overline-two',
  l: 'overline-one',
};

const Overline: React.FunctionComponent<OverlineProps> = ({
  size,
  children,
  color,
  marginBottom,
  className,
}) => {
  return (
    <Typography
      className={classNames(
        moduleStyles.overline,
        moduleStyles[`overline-color-${color}`],
        moduleStyles[`overline-marginBottom-${marginBottom}`],
        className,
      )}
      semanticTag="p"
      visualAppearance={overlineSizeToVisualAppearance[size]}
    >
      {children}
    </Typography>
  );
};

export default Overline;
