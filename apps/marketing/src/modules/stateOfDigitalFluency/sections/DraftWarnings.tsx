import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';

import type {ReportWarning} from '../types';

const describe = (warning: ReportWarning) => {
  if (typeof warning === 'string') {
    return warning;
  }
  const where = [
    warning.postal,
    warning.row != null ? `row ${warning.row}` : null,
    warning.column,
  ]
    .filter(Boolean)
    .join(', ');
  const message = warning.message ?? warning.code ?? 'Unknown issue';
  return where ? `${where}: ${message}` : message;
};

/**
 * Lists the pipeline's warnings at the top of each page. Preview only:
 * callers pass `isDraft` from draftMode(), and nothing renders otherwise.
 */
export default function DraftWarnings({
  warnings,
  isDraft,
}: {
  warnings: ReportWarning[];
  isDraft: boolean;
}) {
  if (!isDraft || warnings.length === 0) {
    return null;
  }

  return (
    <Alert severity="warning" data-testid="sodf-draft-warnings">
      <AlertTitle>
        Draft: {warnings.length} data{' '}
        {warnings.length === 1 ? 'warning' : 'warnings'}
      </AlertTitle>
      <Box component="ul" sx={{m: 0, pl: 2.5}}>
        {warnings.map((warning, i) => (
          <li key={i}>{describe(warning)}</li>
        ))}
      </Box>
    </Alert>
  );
}
