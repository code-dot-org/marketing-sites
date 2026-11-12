import Pie from '@/components/dataDisplay/chart/Pie';
import RankedBars from '@/components/dataDisplay/chart/RankedBars';
import YearBars from '@/components/dataDisplay/chart/YearBars';
import {CODEAI} from '@/components/dataDisplay/codeaiColors';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, userEvent, within} from 'storybook/test';

import {
  accessPoints,
  alabama,
  genderSlices,
  georgia,
  minnesota,
  nationalAverageScore,
  NOT_REPORTED,
  rankedScoreItems,
} from './__mocks__/stateOfDigitalFluency';

const meta: Meta = {
  title: 'Marketing/DataDisplay/Chart',
  tags: ['autodocs', 'marketing'],
};

export default meta;

type Story = StoryObj;

const RANKED_TITLE = 'Digital Fluency Index Score: all states, ranked';
const YEAR_TITLE =
  'Georgia: public high schools offering Digital Sciences courses, by school year';
const PIE_TITLE = 'High school Digital Sciences enrollment by gender';

const rankedProps = {
  title: RANKED_TITLE,
  items: rankedScoreItems,
  highlightKey: 'MN',
  reference: {value: nationalAverageScore, label: 'National average'},
  labelHeading: 'State',
  valueHeading: 'Score',
  emptyLabel: NOT_REPORTED,
};

const yearProps = {
  title: YEAR_TITLE,
  points: accessPoints(georgia),
  color: CODEAI.purplePrimary,
  seriesLabel: 'Georgia',
  referenceLabel: 'National average',
  emptyLabel: NOT_REPORTED,
};

const tableEquivalent = (canvasElement: HTMLElement) =>
  within(canvasElement).getByTestId('data-table-equivalent');

const chartSurface = (canvasElement: HTMLElement) => {
  const svg = canvasElement.querySelector<SVGSVGElement>(
    'svg.MuiChartsSurface-root',
  );
  if (!svg) {
    throw new Error('Missing chart surface');
  }
  return svg;
};

/** The table row whose header cell is `label`. */
const tableRow = (table: HTMLElement, label: string) =>
  within(table).getByRole('rowheader', {name: label}).closest('tr')!;

export const RankedBarsInteractive: Story = {
  render: () => <RankedBars {...rankedProps} />,
  play: async ({canvasElement}) => {
    const table = tableEquivalent(canvasElement);
    await expect(table).toHaveAccessibleName(RANKED_TITLE);
    await expect(within(table).getAllByRole('rowheader')).toHaveLength(51);
    await expect(tableRow(table, 'MN')).toHaveAttribute('aria-current', 'true');
    // Unscored states sort last with a "Not reported" value.
    await expect(tableRow(table, 'AK')).toHaveTextContent(NOT_REPORTED);

    await userEvent.tab();
    await expect(chartSurface(canvasElement)).toContainElement(
      document.activeElement as HTMLElement,
    );
  },
};

export const RankedBarsStatic: Story = {
  render: () => <RankedBars {...rankedProps} interactive={false} />,
  play: async ({canvasElement}) => {
    const surface = chartSurface(canvasElement);
    await expect(surface.closest('[aria-hidden="true"]')).not.toBeNull();
    await expect(tableEquivalent(canvasElement)).toHaveAccessibleName(
      RANKED_TITLE,
    );
    await userEvent.tab();
    await expect(surface).not.toContainElement(
      document.activeElement as HTMLElement,
    );
  },
};

export const RankedBarsPrint: Story = {
  render: () => (
    <RankedBars {...rankedProps} interactive={false} size="print" />
  ),
  play: async ({canvasElement}) => {
    // Print rows are 9 design pixels: 51 rows plus 16 of margin.
    await expect(
      chartSurface(canvasElement).getAttribute('viewBox')?.split(' ')[3],
    ).toBe(String(51 * 9 + 16));
  },
};

export const YearBarsInteractive: Story = {
  render: () => <YearBars {...yearProps} />,
  play: async ({canvasElement}) => {
    const table = tableEquivalent(canvasElement);
    await expect(table).toHaveAccessibleName(YEAR_TITLE);
    await expect(
      within(table)
        .getAllByRole('columnheader')
        .map(h => h.textContent),
    ).toEqual(['Year', 'Georgia', 'National average']);
    // The latest year is missing: a hatched "N/A" bar and a "Not reported" cell.
    const latest = tableRow(table, '2025–26');
    await expect(within(latest).getAllByText(NOT_REPORTED)).toHaveLength(2);
    await expect(
      within(chartSurface(canvasElement) as unknown as HTMLElement).getByText(
        'N/A',
      ),
    ).toBeInTheDocument();

    await userEvent.tab();
    await expect(chartSurface(canvasElement)).toContainElement(
      document.activeElement as HTMLElement,
    );
  },
};

export const YearBarsPrint: Story = {
  render: () => <YearBars {...yearProps} interactive={false} size="print" />,
  play: async ({canvasElement}) => {
    const surface = chartSurface(canvasElement);
    await expect(surface.getAttribute('viewBox')).toBe('0 0 480 120');
    await expect(surface.closest('[aria-hidden="true"]')).not.toBeNull();
  },
};

export const PieTwoSlices: Story = {
  render: () => (
    <Pie
      title={PIE_TITLE}
      slices={genderSlices(alabama, false)}
      emptyLabel={NOT_REPORTED}
    />
  ),
  play: async ({canvasElement}) => {
    const table = tableEquivalent(canvasElement);
    await expect(table).toHaveAccessibleName(PIE_TITLE);
    await expect(tableRow(table, 'Young Women')).toHaveTextContent('34.4%');
    await expect(tableRow(table, 'Young Men')).toHaveTextContent('65.6%');
    await expect(canvasElement.querySelectorAll('svg path')).toHaveLength(2);
  },
};

export const PieSmallSlice: Story = {
  render: () => (
    <Pie
      title={PIE_TITLE}
      slices={genderSlices(minnesota, true)}
      emptyLabel={NOT_REPORTED}
    />
  ),
  play: async ({canvasElement}) => {
    const table = tableEquivalent(canvasElement);
    // The table keeps the true 1.4%; the drawn slice is widened to 10°.
    await expect(tableRow(table, 'Other')).toHaveTextContent('1.4%');
    const fills = Array.from(canvasElement.querySelectorAll('svg path')).map(
      p => p.getAttribute('fill'),
    );
    await expect(fills).toContain(CODEAI.bluePrimary);
  },
};

export const PieNotReported: Story = {
  render: () => (
    <Pie
      title={PIE_TITLE}
      slices={genderSlices(alabama, true)}
      emptyLabel={NOT_REPORTED}
    />
  ),
  play: async ({canvasElement}) => {
    const table = tableEquivalent(canvasElement);
    await expect(tableRow(table, 'Other')).toHaveTextContent(NOT_REPORTED);
    // No slice is drawn for the unreported share.
    const fills = Array.from(canvasElement.querySelectorAll('svg path')).map(
      p => p.getAttribute('fill'),
    );
    await expect(fills).not.toContain(CODEAI.bluePrimary);
  },
};

export const PiePrint: Story = {
  render: () => (
    <Pie
      title={PIE_TITLE}
      slices={genderSlices(minnesota, true)}
      emptyLabel={NOT_REPORTED}
      size="print"
    />
  ),
  play: async ({canvasElement}) => {
    await expect(
      canvasElement.querySelector('svg')?.getAttribute('viewBox'),
    ).toBe('0 0 80 80');
  },
};
