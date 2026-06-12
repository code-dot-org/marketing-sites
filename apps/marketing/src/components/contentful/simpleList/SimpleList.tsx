import {Entry, EntryFields} from 'contentful';
import {useMemo} from 'react';

import {
  SimpleList,
  SIMPLE_LIST_DEFAULT_ICON,
  SimpleListProps,
  SimpleListItem,
} from '@code-dot-org/component-library/list';

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
  extends Omit<SimpleListProps, 'items'> {
  manualList?: string;
  items?: SimpleListItemEntry[];
  iconName?: string;
}

const parseManualList = (raw: string): SimpleListItem[] =>
  raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((label, index) => ({key: `manual-${index}`, label}));

const SimpleListContentful: React.FunctionComponent<
  SimpleListContentfulProps
> = ({
  manualList,
  items = [],
  iconName = SIMPLE_LIST_DEFAULT_ICON,
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

  return (
    <SimpleList
      {...props}
      items={listItems}
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
