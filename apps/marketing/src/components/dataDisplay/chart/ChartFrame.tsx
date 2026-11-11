import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {ReactNode} from 'react';

import DataTable, {type DataTableProps} from '../table/DataTable';
import {visuallyHidden} from '../visuallyHidden';

export interface ChartFrameProps {
  title: string;
  /** Design size of the SVG; it scales to the container width at this ratio. */
  width: number;
  height: number;
  interactive: boolean;
  table: Omit<DataTableProps, 'hidden' | 'caption'>;
  legend?: ReactNode;
  children: ReactNode;
}

/**
 * Wraps a chart: a fixed aspect ratio so nothing shifts while it loads, and
 * a visually hidden table equivalent that is always rendered. Static charts
 * are hidden from assistive technology, which reads the table instead.
 */
export default function ChartFrame({
  title,
  width,
  height,
  interactive,
  table,
  legend,
  children,
}: ChartFrameProps) {
  return (
    <Box component="figure" sx={{m: 0, typography: 'body2', lineHeight: 1.4}}>
      <Box
        aria-hidden={interactive ? undefined : true}
        sx={{
          width: '100%',
          aspectRatio: `${width} / ${height}`,
          // Scale the fixed-size SVG to the container at its design ratio.
          // The wrapper has no static class, only the generated one.
          '& [class*="MuiChartsWrapper-root"]': {
            display: 'block',
            width: '100%',
          },
          '& .MuiChartsSurface-root': {width: '100%', height: 'auto'},
        }}
      >
        {children}
      </Box>
      {legend}
      <Typography component="figcaption" sx={visuallyHidden}>
        {title}
      </Typography>
      <DataTable {...table} caption={title} hidden />
    </Box>
  );
}
