import Stat from '@/components/dataDisplay/stat/Stat';
import StatGroup from '@/components/dataDisplay/stat/StatGroup';
import {formatChange} from '@/modules/stateOfDigitalFluency/readReport';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, within} from 'storybook/test';

import {
  alabama,
  minnesota,
  NOT_REPORTED,
  overview,
  wyoming,
} from './__mocks__/stateOfDigitalFluency';

const meta: Meta<typeof Stat> = {
  title: 'Marketing/DataDisplay/Stat',
  component: Stat,
  tags: ['autodocs', 'marketing'],
  args: {emptyLabel: NOT_REPORTED},
};

export default meta;

type Story = StoryObj<typeof Stat>;

export const OutOfMax: Story = {
  args: {label: 'Policy Maturity', value: minnesota.score.policy, max: 45},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('group', {name: 'Policy Maturity: 38.3 out of 45'}),
    ).toBeInTheDocument();
    await expect(canvas.getByText('/45')).toBeInTheDocument();
  },
};

export const Percentage: Story = {
  args: {label: 'HS Access', value: overview.stats.access, unit: '%'},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('group', {name: 'HS Access: 61.5%'}),
    ).toBeInTheDocument();
  },
};

export const WithDelta: Story = {
  args: {
    label: 'HS Access',
    value: alabama.access.series.at(-1)?.value ?? null,
    unit: '%',
    delta: formatChange(alabama.access.change, ' pts'),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('group', {name: 'HS Access: 77.2%'}),
    ).toHaveTextContent('+2.4 pts');
  },
};

export const NotReported: Story = {
  args: {label: 'Policy Maturity', value: wyoming.score.policy, max: 45},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('group', {name: `Policy Maturity: ${NOT_REPORTED}`}),
    ).toBeInTheDocument();
    await expect(canvas.getByText(NOT_REPORTED)).toBeInTheDocument();
    await expect(canvas.queryByText('/45')).not.toBeInTheDocument();
  },
};

export const PrintSize: Story = {
  args: {
    label: 'Policy Maturity',
    value: minnesota.score.policy,
    max: 45,
    size: 'print',
  },
  play: async ({canvasElement}) => {
    const value = canvasElement.querySelector('[role="group"] p');
    await expect(value).toHaveTextContent('38.3/45');
    await expect(getComputedStyle(value!).fontSize).toBe('20px');
  },
};

const COMPONENTS = [
  {key: 'policy', label: 'Policy Maturity', max: 45},
  {key: 'access', label: 'Access Availability', max: 12},
  {key: 'participation', label: 'Participation', max: 18},
  {key: 'momentum', label: 'Momentum', max: 15},
  {key: 'leadership', label: 'Leadership', max: 10},
] as const;

export const Group: Story = {
  render: () => (
    <StatGroup label="Score components" columns={5}>
      {COMPONENTS.map(c => (
        <Stat
          key={c.key}
          label={c.label}
          value={minnesota.score[c.key]}
          max={c.max}
          emptyLabel={NOT_REPORTED}
        />
      ))}
    </StatGroup>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', {name: 'Score components'});
    await expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    await expect(
      within(list).getByRole('group', {
        name: 'Policy Maturity: 38.3 out of 45',
      }),
    ).toBeInTheDocument();
    await expect(
      within(list).getByRole('group', {name: 'Leadership: 10.0 out of 10'}),
    ).toBeInTheDocument();
  },
};
