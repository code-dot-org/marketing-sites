import TextField from '@mui/material/TextField';
import {ChangeEvent} from 'react';

import {brandRadius} from '@/themes/common/radius';

// Styled like the Hour of AI facet accordions, including their 16px gap below.
const SEARCH_SX = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    borderRadius: brandRadius('md'),
    backgroundColor: 'var(--palette-white)',
    '& fieldset, &:hover fieldset': {borderColor: 'var(--palette-light-pink)'},
    '&.Mui-focused fieldset': {
      borderColor: 'var(--palette-pink)',
      borderWidth: '2px',
    },
  },
  '& .MuiOutlinedInput-input': {
    // The accordion's 12px plus its 1px border, which the outline overlays here.
    padding: '13px 20px',
    fontSize: '0.875rem',
    lineHeight: '148%',
    height: 'auto',
    color: 'var(--palette-black)',
  },
};

/** The Hour of AI catalog's activity search. */
const HourOfAiSearchField = ({
  value,
  onChange,
  noMargin = false,
}: {
  value: string | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  noMargin?: boolean;
}) => (
  <TextField
    fullWidth
    variant="outlined"
    size="small"
    placeholder="Search..."
    aria-label="Search activities"
    value={value}
    onChange={onChange}
    sx={noMargin ? {...SEARCH_SX, mb: 0} : SEARCH_SX}
  />
);

export default HourOfAiSearchField;
