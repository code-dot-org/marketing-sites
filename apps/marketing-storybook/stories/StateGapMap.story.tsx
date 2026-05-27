import StateGapMap from '@/components/contentful/corporateSite/stateGapMap';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, userEvent, within} from 'storybook/test';

import {stateGapMapStoryData} from './__mocks__/stateGapMapData';

const meta: Meta<typeof StateGapMap> = {
  title: 'Marketing/StateGapMap',
  component: StateGapMap,
  tags: ['autodocs', 'marketing'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof StateGapMap>;

const getStateElement = (canvasElement: HTMLElement, code: string) => {
  const element = canvasElement.querySelector<SVGElement>(
    `[data-name="${code}"]`,
  );

  if (!element) {
    throw new Error(`Missing state element for ${code}`);
  }

  return element;
};

export const Playground: Story = {
  args: {
    dataset: stateGapMapStoryData,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Select a state')).toBeInTheDocument();
    await expect(
      canvas.getByText(
        'Hover a state to preview its metrics. Click or tap a state to download the state report and presentation deck.',
      ),
    ).toBeInTheDocument();
  },
};

export const HoverPreview: Story = {
  args: {
    dataset: stateGapMapStoryData,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.hover(getStateElement(canvasElement, 'CA'));
    await expect(canvas.getByText('California')).toBeInTheDocument();
  },
};

export const LockedSelection: Story = {
  args: {
    dataset: stateGapMapStoryData,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(getStateElement(canvasElement, 'CA'));
    await expect(canvas.getByText('California')).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', {name: 'Download State Report'}),
    ).toBeInTheDocument();
  },
};

export const UnavailableData: Story = {
  args: {
    dataset: stateGapMapStoryData,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.hover(getStateElement(canvasElement, 'DC'));
    await expect(canvas.getByText('Washington, D.C.')).toBeInTheDocument();
    await expect(canvas.getAllByText('Data unavailable')).toHaveLength(2);
    await expect(
      canvas.getByText(
        'Data unavailable for this state in the current dataset.',
      ),
    ).toBeInTheDocument();
  },
};

export const ThemeInheritance: Story = {
  render: args => (
    <div
      data-theme="dark"
      style={{background: '#111827', padding: 24, borderRadius: 24}}
    >
      <StateGapMap {...args} />
    </div>
  ),
  args: {
    dataset: stateGapMapStoryData,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText('Select a state');
    const body = canvas.getByText(
      'Hover a state to preview its metrics. Click or tap a state to download the state report and presentation deck.',
    );
    const headingColor = getComputedStyle(heading).color;

    await expect(heading).toBeInTheDocument();
    await expect(body).toBeInTheDocument();
    await expect(
      headingColor === 'rgba(255, 255, 255, 0.96)' ||
        headingColor === 'rgb(255, 255, 255)',
    ).toBe(true);
  },
};

export const GeographyCoverage: Story = {
  args: {
    dataset: stateGapMapStoryData,
  },
  play: async ({canvasElement}) => {
    await expect(getStateElement(canvasElement, 'RI')).toBeInTheDocument();
    await expect(getStateElement(canvasElement, 'AK')).toBeInTheDocument();
    await expect(getStateElement(canvasElement, 'DC')).toBeInTheDocument();
  },
};
