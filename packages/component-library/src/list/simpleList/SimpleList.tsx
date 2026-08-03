import classNames from 'classnames';
import {Key, ReactNode, HTMLAttributes} from 'react';

import {
  componentSizeToBodyTextSizeMap,
  textScaleSizeToBodyTextSizeMap,
} from '@/common/constants';
import {ComponentSizeXSToL, TextScaleSize} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import Typography from '@/typography';

import moduleStyles from './simpleList.module.scss';

export const SIMPLE_LIST_DEFAULT_ICON = 'circle-small';

export type SimpleListItem = {
  key: Key;
  label: string | ReactNode;
};

export type SimpleListType = 'primary' | 'secondary' | 'brand';

/**
 * SimpleList accepts both the legacy 4-cell size scale (`xs`/`s`/`m`/`l`)
 * and the spec 009 amendment-5 Text scale (`text-xs` through `text-4xl`).
 * Legacy values are preserved so existing consumers and stored Contentful
 * entries keep rendering.
 */
export type SimpleListSize = ComponentSizeXSToL | TextScaleSize;

export interface SimpleListProps extends HTMLAttributes<HTMLUListElement> {
  /** SimpleList items */
  items: SimpleListItem[];
  /** SimpleList icon */
  icon?: FontAwesomeV6IconProps;
  /** SimpleList size */
  size?: SimpleListSize;
  /** Icon style preset. Overridden when `iconColor` is set. */
  type?: SimpleListType;
  /** Icon color — any CSS color value (e.g. `var(--codeai-purple-primary)` or `#fff`). Overrides `type`. */
  iconColor?: string;
  /** Label color — any CSS color value. Unset leaves the inherited default. */
  textColor?: string;
  /** SimpleList text weight */
  weight?: 'normal' | 'bold';
  /** Class of the list */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/SimpleList.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: SimpleList Component.
 * Renders a list of items.
 */
const isTextScaleSize = (size: SimpleListSize): size is TextScaleSize =>
  size.startsWith('text-');

const SimpleList: React.FC<SimpleListProps> = ({
  items,
  className,
  size = 'text-md',
  type = 'primary',
  iconColor,
  textColor,
  weight = 'normal',
  icon = {
    iconName: SIMPLE_LIST_DEFAULT_ICON,
    iconStyle: 'solid',
  },
  ...HTMLAttributes
}: SimpleListProps) => {
  const visualAppearance = isTextScaleSize(size)
    ? textScaleSizeToBodyTextSizeMap[size]
    : componentSizeToBodyTextSizeMap[size];
  return (
    <ul
      className={classNames(
        moduleStyles.simpleList,
        moduleStyles[`simpleList-type-${type}`],
        moduleStyles[`simpleList-size-${size}`],
        moduleStyles[`simpleList-weight-${weight}`],
        className,
      )}
      {...HTMLAttributes}
    >
      {items.map(({key, label}) => (
        <li key={key} className={classNames(moduleStyles.simpleListItem)}>
          <FontAwesomeV6Icon
            {...icon}
            aria-hidden="true"
            className={classNames(
              moduleStyles.simpleListItemIcon,
              icon.iconName == SIMPLE_LIST_DEFAULT_ICON &&
                moduleStyles.simpleListItemBullet,
              icon.className,
            )}
            style={iconColor ? {color: iconColor, ...icon.style} : icon.style}
          />

          <Typography
            semanticTag="span"
            className={moduleStyles.simpleListItemLabel}
            visualAppearance={visualAppearance}
            style={textColor ? {color: textColor} : undefined}
          >
            {label}
          </Typography>
        </li>
      ))}
    </ul>
  );
};

export default SimpleList;
