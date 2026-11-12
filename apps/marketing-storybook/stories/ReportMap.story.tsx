import UsMap from '@/components/dataDisplay/map/UsMap';
import UsMapInteractive from '@/components/dataDisplay/map/UsMapInteractive';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import {
  mapLegend,
  mapRegions,
  mapTooltips,
  NOT_REPORTED,
} from './__mocks__/stateOfDigitalFluency';

const TITLE = 'Digital Fluency Index Score by state';

const meta: Meta<typeof UsMapInteractive> = {
  title: 'Marketing/DataDisplay/ReportMap',
  component: UsMapInteractive,
  tags: ['autodocs', 'marketing'],
  args: {
    tooltips: mapTooltips,
    onActiveChange: fn(),
  },
  render: args => (
    <UsMapInteractive {...args}>
      <UsMap
        title={TITLE}
        regions={mapRegions}
        legend={mapLegend}
        tableColumns={[
          {key: 'name', label: 'State'},
          {key: 'score', label: 'Score', numeric: true},
          {key: 'band', label: 'Score band'},
        ]}
        emptyLabel={NOT_REPORTED}
      />
    </UsMapInteractive>
  ),
};

export default meta;

type Story = StoryObj<typeof UsMapInteractive>;

const link = (canvasElement: HTMLElement, selector: string) => {
  const element = canvasElement.querySelector<SVGAElement>(selector);
  if (!element) {
    throw new Error(`Missing map link ${selector}`);
  }
  return element;
};

export const KeyboardFocus: Story = {
  play: async ({args, canvasElement}) => {
    // Alaska is first in document order, then Alabama.
    await userEvent.tab();
    await userEvent.tab();
    const alabama = link(canvasElement, 'a[data-code="AL"]');
    await expect(document.activeElement).toBe(alabama);
    await expect(alabama).toHaveAttribute(
      'aria-label',
      'Alabama, score 38.1, 0 – 50',
    );
    await expect(args.onActiveChange).toHaveBeenLastCalledWith('AL');

    // Enter follows the link; check where without leaving the story frame.
    await expect(alabama).toHaveAttribute(
      'href',
      '/en-US/state-of-digital-fluency/al',
    );
  },
};

export const DcCallout: Story = {
  play: async ({args, canvasElement}) => {
    const shape = link(canvasElement, 'a[data-code="DC"][aria-hidden]');
    await expect(shape).toHaveAttribute('tabindex', '-1');

    const callout = link(canvasElement, 'a[data-code="DC"]:not([aria-hidden])');
    await expect(callout.querySelector('circle')).not.toBeNull();
    await expect(callout).toHaveAttribute(
      'aria-label',
      'District of Columbia, score 87.6, 81 – 100',
    );
    callout.focus();
    await expect(document.activeElement).toBe(callout);
    await expect(args.onActiveChange).toHaveBeenLastCalledWith('DC');

    // Tabbing through every link reaches DC once, via the callout.
    callout.blur();
    const visited: string[] = [];
    for (let i = 0; i < mapRegions.length; i++) {
      await userEvent.tab();
      const active = document.activeElement;
      visited.push(
        `${active?.getAttribute('data-code')}${active === shape ? ':shape' : ''}`,
      );
    }
    await expect(visited.filter(code => code.startsWith('DC'))).toEqual(['DC']);
    await expect(new Set(visited).size).toBe(mapRegions.length);
  },
};

export const NotReportedStates: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const alaska = link(canvasElement, 'a[data-code="AK"]');
    await expect(alaska).toHaveAttribute(
      'aria-label',
      `Alaska, score ${NOT_REPORTED}, ${NOT_REPORTED}`,
    );
    await expect(alaska.querySelector('path')).toHaveAttribute(
      'fill',
      'url(#us-map-not-reported)',
    );
    const legend = canvas.getByRole('list', {name: 'Legend'});
    await expect(within(legend).getByText(NOT_REPORTED)).toBeInTheDocument();
  },
};
