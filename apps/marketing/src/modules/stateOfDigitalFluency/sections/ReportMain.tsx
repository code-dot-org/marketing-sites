import Box from '@mui/material/Box';
import type {ReactNode} from 'react';

import {Section} from '@/components/dataDisplay/brandComponents';

import type {ReportWarning} from '../types';

import DraftWarnings from './DraftWarnings';

/** The page's <main>, with the draft warnings above the report on preview. */
export default function ReportMain({
  warnings,
  isDraft,
  children,
}: {
  warnings: ReportWarning[];
  isDraft: boolean;
  children: ReactNode;
}) {
  return (
    <Box component="main" sx={{width: '100%'}}>
      {isDraft && warnings.length > 0 && (
        <Section background="white" padding="m">
          <DraftWarnings warnings={warnings} isDraft={isDraft} />
        </Section>
      )}
      {children}
    </Box>
  );
}
