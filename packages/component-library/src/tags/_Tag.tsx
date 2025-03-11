import React, {HTMLAttributes, memo, useCallback} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import {WithTooltip} from '@/tooltip';

import moduleStyles from './tags.module.scss';
import CloseButton from '@/closeButton/CloseButton';
import {ComponentSizeXSToL} from '@/common/types';

type TagIconProps = {
  iconName: string;
  iconStyle: 'light' | 'solid' | 'regular' | 'thin';
  title: string;
  placement: 'left' | 'right';
};

const TagIcon: React.FC<TagIconProps> = memo(({iconName, iconStyle, title}) => (
  <FontAwesomeV6Icon iconName={iconName} iconStyle={iconStyle} title={title} />
));

export interface TagProps {
  /** Tag label */
  label: string;
  /** Tag tooltip content. Can be a simple string or ReactNode (some jsx/html markup/view).
   *  For example - check Tags.story.tsx
   *  Can be null to disable the tooltip */
  tooltipContent?: string | React.ReactNode;
  /** Tag tooltip id (required for better accessibility, see ) */
  tooltipId?: string;
  /** aria-label for the tag.
   *  Used to allow screen reader to read tag as ariaLabel content instead of the label content */
  ariaLabel?: string;
  /** Icon (object) to show next to text label (optional).
   *  Icon object consists of icon(icon name/style, title for screenReader,
   *  and the placement of the icon (left or right))*/
  icon?: TagIconProps;
  /** Unique key */
  key?: string | number;
  /** onClose callback indicates the tag should have an accessible close button on the
   * right side of the label */
  onClose?: () => void;
  /** Size of tag */
  size?: Exclude<ComponentSizeXSToL, 'xs'>;
}

const Tag: React.FunctionComponent<TagProps> = ({
  label,
  ariaLabel,
  tooltipContent,
  tooltipId,
  icon,
  onClose,
  size = 's',
}) => {
  const tooltipWrapper = useCallback(
    (children: React.ReactNode) =>
      tooltipContent && tooltipId ? (
        <WithTooltip
          tooltipProps={{
            direction: 'onTop',
            text: tooltipContent,
            tooltipId: tooltipId,
          }}
        >
          {children}
        </WithTooltip>
      ) : (
        children
      ),
    [tooltipContent, tooltipId],
  );
  const containerAttrs: HTMLAttributes<HTMLDivElement> = {
    className: moduleStyles.tag,
    tabIndex: 0,
    'aria-label': ariaLabel,
    'aria-describedby': tooltipContent && tooltipId ? tooltipId : undefined,
  };
  if (onClose) {
    delete containerAttrs.tabIndex;
    return tooltipWrapper(
      <div {...containerAttrs}>
        <span>{label}</span>
        <CloseButton
          onClick={onClose}
          aria-label={`Close ${ariaLabel ?? label}`}
          size={size}
          tabIndex={0}
        />
      </div>,
    );
  }
  return tooltipWrapper(
    <div {...containerAttrs}>
      {icon && icon.placement === 'left' && <TagIcon {...icon} />}
      <span>{label}</span>
      {icon && icon.placement === 'right' && <TagIcon {...icon} />}
    </div>,
  );
};

export default memo(Tag);
