import classNames from 'classnames';
import React, {KeyboardEvent, memo} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import {WithTooltip} from '@/tooltip';

import moduleStyles from './tags.module.scss';

type TagIconProps = {
  iconName: string;
  iconStyle: 'light' | 'solid' | 'regular' | 'thin';
  title: string;
  placement: 'left' | 'right';
  onClick?: () => void;
};

const TagIcon: React.FC<TagIconProps> = memo(
  ({iconName, iconStyle, title, onClick}) => {
    const onClickProps = onClick
      ? {
          role: 'button',
          tabIndex: 0,
          onClick,
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClick();
            }
          },
        }
      : {};
    return (
      <FontAwesomeV6Icon
        iconName={iconName}
        iconStyle={iconStyle}
        title={title}
        {...onClickProps}
        className={classNames({
          [moduleStyles.icon_clickable]: onClick,
        })}
      />
    );
  },
);

export interface TagProps {
  /** Tag label */
  label: string;
  /** Unique key */
  key?: string | number;
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
}

const Tag: React.FunctionComponent<TagProps> = ({
  label,
  tooltipContent,
  tooltipId,
  icon,
}) => {
  return tooltipContent && tooltipId ? (
    <WithTooltip
      tooltipProps={{
        direction: 'onTop',
        text: tooltipContent,
        tooltipId,
      }}
    >
      <div
        // prevent double tabbing if tag icon has onClick
        tabIndex={icon?.onClick ? undefined : 0}
        aria-describedby={tooltipId}
        className={moduleStyles.tag}
      >
        {icon && icon.placement === 'left' && <TagIcon {...icon} />}
        <span>{label}</span>
        {icon && icon.placement === 'right' && <TagIcon {...icon} />}
      </div>
    </WithTooltip>
  ) : (
    <div className={moduleStyles.tag}>
      {icon && icon.placement === 'left' && <TagIcon {...icon} />}
      <span>{label}</span>
      {icon && icon.placement === 'right' && <TagIcon {...icon} />}
    </div>
  );
};

export default memo(Tag);
