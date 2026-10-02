import TextCollection, {
  TextCollectionProps,
} from '@/components/contentful/collections/textCollection';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import TextCollectionAlphabeticalMock from './__mocks__/TextCollectionAlphabetical.json';

const meta: Meta<TextCollectionProps> = {
  title: 'Marketing/Collection/Text',
  component: TextCollection,
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: ['default', '1', '2', '3', '4', '5', '6'],
    },
  },
};
export default meta;

type Story = StoryObj<TextCollectionProps>;

export const SortedAlphabetically: Story = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: TextCollectionAlphabeticalMock as any,
  play: async ({canvas}) => {
    for (const text of TextCollectionAlphabeticalMock.textCollection) {
      expect(canvas.getByText(text.fields.shortText)).toBeInTheDocument();
    }
  },
};

export const SixColumns: Story = {
  args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(TextCollectionAlphabeticalMock as any),
    columns: '6',
  },
  play: async ({canvas}) => {
    const first = canvas.getByText(
      TextCollectionAlphabeticalMock.textCollection[0].fields.shortText,
    );
    expect(first.closest('.MuiGrid-grid-xs-1')).toBeInTheDocument();
  },
};
