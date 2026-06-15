import {Entry, EntryFields} from 'contentful';
import {useMemo} from 'react';

import {
  SimpleList,
  SIMPLE_LIST_DEFAULT_ICON,
  SimpleListProps,
  SimpleListItem,
} from '@code-dot-org/component-library/list';

import {
  BrandColor,
  cssVarForBrandColor,
  LEGACY_ICON_COLORS,
  LegacyIconColor,
} from '@/components/common/colors';
import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';

export type SimpleListItemEntry = Entry & {
  sys: {
    id: string;
  };
  fields: {
    shortText: EntryFields.Text;
  };
};

export interface SimpleListContentfulProps
  extends Omit<SimpleListProps, 'items' | 'type' | 'iconColor' | 'textColor'> {
  manualList?: string;
  items?: SimpleListItemEntry[];
  iconName?: string;
  /** Contentful icon-color selection: brand-manifest values or legacy options. */
  type?: BrandColor | LegacyIconColor;
  /** Contentful text-color selection: brand-manifest values. */
  textColor?: BrandColor;
}

const parseManualList = (raw: string): SimpleListItem[] =>
  raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((label, index) => ({key: `manual-${index}`, label}));

const isLegacyIconColor = (
  value: BrandColor | LegacyIconColor | undefined,
): value is LegacyIconColor =>
  !!value && (LEGACY_ICON_COLORS as readonly string[]).includes(value);

const SimpleListContentful: React.FunctionComponent<
  SimpleListContentfulProps
> = ({
  manualList,
  items = [],
  iconName = SIMPLE_LIST_DEFAULT_ICON,
  type,
  textColor,
  ...props
}) => {
  const listItems: SimpleListItem[] = useMemo(() => {
    if (manualList?.trim()) {
      return parseManualList(manualList);
    }
    return items.filter(Boolean).map(entry => ({
      key: entry.sys.id,
      label: entry.fields.shortText,
    }));
  }, [manualList, items]);

  if (!listItems.length) {
    return (
      <em>
        <strong>🗂️ Simple List placeholder.</strong> Type items in the Manual
        List field (one per line), or bind a "List" entry.
      </em>
    );
  }

  // Legacy icon-color values render via the component library's `type` SCSS
  // classes; everything else is a brand-manifest CSS value applied inline.
  const legacyType = isLegacyIconColor(type) ? type : undefined;
  const iconColor =
    type && !isLegacyIconColor(type) ? cssVarForBrandColor(type) : undefined;
  const resolvedTextColor = textColor
    ? cssVarForBrandColor(textColor)
    : undefined;

  return (
    <SimpleList
      {...props}
      items={listItems}
      type={legacyType}
      iconColor={iconColor}
      textColor={resolvedTextColor}
      icon={{
        iconName,
        iconStyle: 'solid',
        iconFamily: fontAwesomeV6BrandIconsMap.has(iconName)
          ? 'brands'
          : undefined,
      }}
    />
  );
};

export default SimpleListContentful;
