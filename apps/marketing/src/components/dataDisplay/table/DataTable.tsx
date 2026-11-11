import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type {ReactNode} from 'react';

import {visuallyHidden} from '../visuallyHidden';

export interface DataTableColumn {
  key: string;
  label: string;
  /** Right-aligns the column. */
  numeric?: boolean;
}

export interface DataTableRow {
  key: string;
  /** Cell values by column key. `null` or `undefined` shows `emptyLabel`. */
  cells: Record<string, ReactNode | null | undefined>;
}

export interface DataTableProps {
  caption: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  /** Row to emphasise, by key. */
  highlightKey?: string;
  emptyLabel: string;
  /** Rendered for assistive technology only: the equivalent of a chart or map. */
  hidden?: boolean;
  size?: 'default' | 'print';
}

/**
 * A captioned table. The first column is the row header. Used on its own and,
 * with `hidden`, as the text equivalent of every chart and of the map.
 */
export default function DataTable({
  caption,
  columns,
  rows,
  highlightKey,
  emptyLabel,
  hidden = false,
  size = 'default',
}: DataTableProps) {
  const [headerColumn, ...valueColumns] = columns;

  const table = (
    <Table
      size={size === 'print' ? 'small' : 'medium'}
      data-testid={hidden ? 'data-table-equivalent' : 'data-table'}
    >
      <caption style={hidden ? undefined : {captionSide: 'top'}}>
        {caption}
      </caption>
      <TableHead>
        <TableRow>
          {columns.map(column => (
            <TableCell
              key={column.key}
              scope="col"
              align={column.numeric ? 'right' : 'left'}
              sx={{fontWeight: 700}}
            >
              {column.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(row => {
          const highlighted = row.key === highlightKey;
          const cell = (key: string) => row.cells[key] ?? emptyLabel;
          return (
            <TableRow
              key={row.key}
              selected={highlighted}
              aria-current={highlighted ? 'true' : undefined}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{fontWeight: highlighted ? 700 : 400}}
              >
                {cell(headerColumn.key)}
              </TableCell>
              {valueColumns.map(column => (
                <TableCell
                  key={column.key}
                  align={column.numeric ? 'right' : 'left'}
                  sx={{
                    fontWeight: highlighted ? 700 : 400,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {cell(column.key)}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  // A <table> won't shrink below its content, so hide a wrapper instead.
  return hidden ? <Box sx={visuallyHidden}>{table}</Box> : table;
}
