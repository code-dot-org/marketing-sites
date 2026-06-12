import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import SimpleList, {
  SimpleListItemEntry,
  SimpleListContentfulProps,
} from '@/components/contentful/simpleList/SimpleList';

describe('SimpleList component', () => {
  const entryItems: SimpleListItemEntry[] = [
    {sys: {id: 'item-a'}, fields: {shortText: 'Item A'}},
    {sys: {id: 'item-b'}, fields: {shortText: 'Item B'}},
  ];

  const renderListContainer = (props: Partial<SimpleListContentfulProps>) => {
    render(<SimpleList {...props} />);
  };

  it('renders list from bound entry items', () => {
    renderListContainer({items: entryItems});
    expect(screen.getByRole('list')).toBeVisible();
    entryItems.forEach(({fields: {shortText}}) => {
      expect(screen.getByText(shortText)).toBeVisible();
    });
  });

  describe('manualList', () => {
    it('parses one item per line', () => {
      renderListContainer({manualList: 'First\nSecond\nThird'});
      expect(screen.getByRole('list')).toBeVisible();
      expect(screen.getByText('First')).toBeVisible();
      expect(screen.getByText('Second')).toBeVisible();
      expect(screen.getByText('Third')).toBeVisible();
    });

    it('trims whitespace and drops blank lines', () => {
      renderListContainer({manualList: '  One  \n\n\nTwo\n   '});
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(2);
      expect(screen.getByText('One')).toBeVisible();
      expect(screen.getByText('Two')).toBeVisible();
    });

    it('takes precedence over entry items', () => {
      renderListContainer({
        manualList: 'Manual wins',
        items: entryItems,
      });
      expect(screen.getByText('Manual wins')).toBeVisible();
      expect(screen.queryByText('Item A')).toBeNull();
    });

    it('falls back to entry items when only whitespace', () => {
      renderListContainer({manualList: '   \n  \n', items: entryItems});
      expect(screen.getByText('Item A')).toBeVisible();
    });
  });

  describe('when nothing is provided', () => {
    it('renders empty list placeholder', () => {
      renderListContainer({});
      expect(
        screen.getByText(
          (_, node) =>
            node?.tagName === 'EM' &&
            !!node?.textContent?.includes('Simple List placeholder'),
        ),
      ).toBeVisible();
    });
  });
});
