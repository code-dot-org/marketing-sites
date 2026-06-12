import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import SimpleList, {SimpleListProps} from '../SimpleList';

describe('Design System - SimpleList', () => {
  const items = [
    {key: 'item-a', label: 'Item A'},
    {key: 'item-b', label: 'Item B'},
  ];

  const renderListContainer = (props: Partial<SimpleListProps> = {}) => {
    render(<SimpleList {...props} {...{items}} />);
  };

  const getList = () => screen.getByRole('list');

  it('renders list', () => {
    renderListContainer();
    expect(getList()).toBeVisible();
  });

  it('renders list items', () => {
    renderListContainer();

    items.forEach(({label}) => {
      expect(screen.getByText(label)).toBeVisible();
    });
  });

  it('renders list with provided className styles', () => {
    const className = 'customClass';
    const classStyle = 'color: red;';

    renderListContainer({className});
    const list = getList();

    expect(list).not.toHaveStyle(classStyle);

    // Add custom CSS directly in the test
    const style = document.createElement('style');
    style.innerHTML = `.${className} { ${classStyle} }`;
    document.head.appendChild(style);

    expect(list).toHaveStyle(classStyle);
  });

  it.each(['black', 'white', 'brand1', 'brand2', 'brand3'] as const)(
    'applies the icon color class for %s',
    color => {
      renderListContainer({type: color});
      expect(getList().className).toContain(`simpleList-type-${color}`);
    },
  );

  it('omits a text color class when textColor is unset', () => {
    renderListContainer({});
    expect(getList().className).not.toContain('simpleList-text-color-');
  });

  it.each(['primary', 'black', 'white', 'brand1', 'brand2', 'brand3'] as const)(
    'applies the text color class when textColor=%s',
    color => {
      renderListContainer({textColor: color});
      expect(getList().className).toContain(`simpleList-text-color-${color}`);
    },
  );
});
