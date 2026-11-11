import DataTable from '@/components/dataDisplay/table/DataTable';
import {
  formatRank,
  formatScore,
} from '@/modules/stateOfDigitalFluency/readReport';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, within} from 'storybook/test';

import {NOT_REPORTED, rankings} from './__mocks__/stateOfDigitalFluency';

// Top five by rank plus the first unranked state, so one row is "Not reported".
const rows = [
  ...rankings.score.slice(0, 5),
  rankings.score.find(r => r.rank == null)!,
].map(r => ({
  key: r.postal,
  cells: {
    name: r.name,
    rank: r.rank == null ? null : formatRank(r.rank),
    score: r.value == null ? null : formatScore(r.value),
  },
}));

const meta: Meta<typeof DataTable> = {
  title: 'Marketing/DataDisplay/DataTable',
  component: DataTable,
  tags: ['autodocs', 'marketing'],
  args: {
    caption: 'Digital Fluency Index Score, selected states',
    columns: [
      {key: 'name', label: 'State'},
      {key: 'rank', label: 'Rank', numeric: true},
      {key: 'score', label: 'Score', numeric: true},
    ],
    rows,
    highlightKey: 'MN',
    emptyLabel: NOT_REPORTED,
  },
};

export default meta;

type Story = StoryObj<typeof DataTable>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table', {
      name: 'Digital Fluency Index Score, selected states',
    });

    const columnHeaders = within(table).getAllByRole('columnheader');
    await expect(columnHeaders).toHaveLength(3);
    for (const header of columnHeaders) {
      await expect(header).toHaveAttribute('scope', 'col');
    }
    const rowHeaders = within(table).getAllByRole('rowheader');
    await expect(rowHeaders).toHaveLength(6);
    for (const header of rowHeaders) {
      await expect(header).toHaveAttribute('scope', 'row');
    }

    // Numeric columns are right-aligned, the label column is not.
    await expect(getComputedStyle(columnHeaders[0]).textAlign).toBe('left');
    await expect(getComputedStyle(columnHeaders[2]).textAlign).toBe('right');

    const highlighted = table.querySelector('tr[aria-current="true"]');
    await expect(highlighted).toHaveTextContent('Minnesota');
    await expect(table.querySelectorAll('[aria-current]')).toHaveLength(1);

    const unranked = within(table)
      .getByRole('rowheader', {name: 'Alaska'})
      .closest('tr')!;
    await expect(within(unranked).getAllByText(NOT_REPORTED)).toHaveLength(2);
  },
};

export const VisuallyHidden: Story = {
  args: {hidden: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const table = canvas.getByTestId('data-table-equivalent');
    await expect(table).toHaveAccessibleName(
      'Digital Fluency Index Score, selected states',
    );
    // Hidden by its wrapper, so the table keeps its own layout.
    const style = getComputedStyle(table.parentElement!);
    await expect(style.position).toBe('absolute');
    await expect(style.clip).toBe('rect(0px, 0px, 0px, 0px)');
  },
};
