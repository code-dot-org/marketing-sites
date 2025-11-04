/* eslint-disable @typescript-eslint/no-explicit-any */
import {render} from '@testing-library/react';

import TextCollection from '../TextCollection';

describe('TextCollection', () => {
  const mockTextCollection = [
    {
      fields: {shortText: 'Apple'},
    },
    {
      fields: {shortText: 'Banana'},
    },
    {
      fields: {shortText: 'Cherry'},
    },
  ];

  it('renders placeholder when textCollection is undefined', () => {
    const {getByText} = render(
      <TextCollection textCollection={undefined as any} sortOrder="manual" />,
    );
    expect(getByText(/Text Collection placeholder/i)).toBeInTheDocument();
    expect(
      getByText(/Please add a "List" content type entry/i),
    ).toBeInTheDocument();
  });

  it('renders all items in textCollection', () => {
    const {getByText} = render(
      <TextCollection
        textCollection={mockTextCollection as any}
        sortOrder="manual"
      />,
    );
    expect(getByText('Apple')).toBeInTheDocument();
    expect(getByText('Banana')).toBeInTheDocument();
    expect(getByText('Cherry')).toBeInTheDocument();
  });

  it('sorts items alphabetically when sortOrder is "alphabetical"', () => {
    const unsortedTextCollection = [
      {
        fields: {shortText: 'Cherry'},
      },
      {
        fields: {shortText: 'Apple'},
      },
      {
        fields: {shortText: 'Banana'},
      },
    ];
    const {getAllByText} = render(
      <TextCollection
        textCollection={unsortedTextCollection as any}
        sortOrder="alphabetical"
      />,
    );
    const items = getAllByText(/Apple|Banana|Cherry/);
    expect(items[0]).toHaveTextContent('Apple');
    expect(items[1]).toHaveTextContent('Banana');
    expect(items[2]).toHaveTextContent('Cherry');
  });

  it('applies custom className to Grid container', () => {
    const {container} = render(
      <TextCollection
        textCollection={mockTextCollection as any}
        className="custom-class"
        sortOrder="manual"
      />,
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
