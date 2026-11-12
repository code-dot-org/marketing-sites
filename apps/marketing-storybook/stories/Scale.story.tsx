import Scale from '@/components/dataDisplay/scale/Scale';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, within} from 'storybook/test';

import {
  minnesota,
  NOT_REPORTED,
  policyScaleGroups,
  wyoming,
} from './__mocks__/stateOfDigitalFluency';

const meta: Meta<typeof Scale> = {
  title: 'Marketing/DataDisplay/Scale',
  component: Scale,
  tags: ['autodocs', 'marketing'],
  args: {emptyLabel: NOT_REPORTED},
};

export default meta;

type Story = StoryObj<typeof Scale>;

const EXPECTED_GROUPS = [
  ['System Levers', 4],
  ['Student Experiences', 3],
  ['Teacher Supports', 3],
] as const;

export const PolicyGroups: Story = {
  args: {groups: policyScaleGroups(minnesota)},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    for (const [label, count] of EXPECTED_GROUPS) {
      const section = canvas.getByRole('region', {name: label});
      const list = within(section).getByRole('list');
      await expect(within(list).getAllByRole('listitem')).toHaveLength(count);
    }
    // The level is part of the item's text, not only the decorative pill.
    await expect(
      canvas.getByText('K-12 Digital Science Standards', {exact: false}),
    ).toHaveTextContent('K-12 Digital Science Standards: Developing');
  },
};

export const NotReportedItem: Story = {
  args: {groups: policyScaleGroups(wyoming)},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole('region', {name: 'Teacher Supports'});
    await expect(
      within(section).getByText('Preservice Teacher Programs', {exact: false}),
    ).toHaveTextContent(`Preservice Teacher Programs: ${NOT_REPORTED}`);
  },
};

export const PrintSize: Story = {
  args: {groups: policyScaleGroups(minnesota), size: 'print'},
  play: async ({canvasElement}) => {
    const segment = canvasElement.querySelector('li [aria-hidden] > div');
    await expect(segment).not.toBeNull();
    await expect(segment!.getBoundingClientRect().height).toBe(6);
  },
};
