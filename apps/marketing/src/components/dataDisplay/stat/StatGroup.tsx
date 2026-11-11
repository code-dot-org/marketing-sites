import Box from '@mui/material/Box';
import {Children, type ReactNode} from 'react';

import FlexColumns from '../layout/FlexColumns';

export interface StatGroupProps {
  children: ReactNode;
  /** Columns at the widest breakpoint. */
  columns?: number;
  /** Where `columns` starts. Below it the row shows 3, then 2. */
  wideFrom?: 'md' | 'lg';
  /**
   * Natural widths spread edge to edge from `wideFrom`, so the first and
   * last stats line up with the content above. Centred and wrapping below.
   */
  spread?: boolean;
  label?: string;
}

/** A responsive row of Stats, exposed as a list. */
export default function StatGroup({
  children,
  columns = 6,
  wideFrom = 'md',
  spread = false,
  label,
}: StatGroupProps) {
  const items = Children.map(children, child =>
    child ? <Box component="li">{child}</Box> : null,
  );

  if (spread) {
    return (
      <Box
        component="ul"
        aria-label={label}
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: {xs: 'center', [wideFrom]: 'space-between'},
          gap: 4,
        }}
      >
        {items}
      </Box>
    );
  }

  return (
    <FlexColumns
      component="ul"
      aria-label={label}
      columns={{xs: 2, sm: 3, [wideFrom]: columns}}
    >
      {items}
    </FlexColumns>
  );
}
