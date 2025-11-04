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
