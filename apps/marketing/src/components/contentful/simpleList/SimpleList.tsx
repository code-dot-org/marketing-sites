import {Entry, EntryFields} from 'contentful';
import {useMemo} from 'react';

import {
  SimpleList,
  SIMPLE_LIST_DEFAULT_ICON,
  SimpleListProps,
  SimpleListItem,
  SimpleListSize,
} from '@code-dot-org/component-library/list';

import {
  BrandColor,
  LEGACY_ICON_COLORS,
  LegacyIconColor,
  resolvedCssVarForBrandColor,
} from '@/components/common/colors';
import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';

export type SimpleListItemEntry = Entry & {
  sys: {
    id: string;
  };
  fields: {
    shortText: EntryFields.Text;
  };
};

export interface SimpleListContentfulProps
  extends Omit<
    SimpleListProps,
    'items' | 'type' | 'iconColor' | 'textColor' | 'size'
  > {
  manualList?: string;
  items?: SimpleListItemEntry[];
  iconName?: string;
  /**
   * Contentful size selection. New entries use the spec 009 amendment-5
   * Text scale (`text-md` default, `text-xs` through `text-4xl`); legacy
   * stored values (`xs`/`s`/`m`/`l`) auto-map at render time.
   */
  size?: SimpleListSize;
  /** Contentful icon-color selection: brand-manifest values or legacy options. */
  type?: BrandColor | LegacyIconColor;
  /** Contentful text-color selection: brand-manifest values. */
  textColor?: BrandColor;
}

// Legacy stored values from before spec 009 amendment-5 map to Text-scale
// equivalents so existing Contentful entries continue rendering without
// any author re-publish.
const LEGACY_SIZE_AUTO_MAP: Record<'xs' | 's' | 'm' | 'l', SimpleListSize> = {
  xs: 'text-xs',
  s: 'text-sm',
  m: 'text-md',
  l: 'text-lg',
};

const resolveSize = (size: SimpleListSize | undefined): SimpleListSize => {
  if (!size) return 'text-md';
  if (size in LEGACY_SIZE_AUTO_MAP) {
    return LEGACY_SIZE_AUTO_MAP[size as keyof typeof LEGACY_SIZE_AUTO_MAP];
  }
  return size;
};

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
  size,
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
  // classes; everything else is a brand-manifest CSS value applied inline,
  // routed through the contrast switch via the enclosing SectionBackground.
  const enclosingBackground = useSectionBackground();
  const legacyType = isLegacyIconColor(type) ? type : undefined;
  const iconColor =
    type && !isLegacyIconColor(type)
      ? resolvedCssVarForBrandColor(type, enclosingBackground)
      : undefined;
  const resolvedTextColor = textColor
    ? resolvedCssVarForBrandColor(textColor, enclosingBackground)
    : undefined;

  return (
    <SimpleList
      {...props}
      items={listItems}
      size={resolveSize(size)}
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
