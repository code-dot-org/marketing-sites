import Box from '@mui/material/Box';
import {SxProps, Theme} from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';

import {ActivityType} from '@/modules/activityCatalog/types/Activity';
import {brandRadius} from '@/themes/common/radius';
import {HOUR_OF_AI_TEXT_FONT_STACK} from '@/themes/hourofai/typography/fontStack';

const OPTIONS: {value?: ActivityType; label: string}[] = [
  {label: 'All activities'},
  {value: ActivityType.HOUR_OF_AI, label: 'Hour of AI'},
  {value: ActivityType.HOUR_OF_CODE, label: 'Hour of Code'},
];

// Styled like the Hour of AI facet accordions. Selected only swaps colors, so
// the buttons keep their size.
const BUTTON_SX: SxProps<Theme> = {
  borderRadius: brandRadius('md'),
  border: '1px solid var(--palette-dark-purple)',
  backgroundColor: 'var(--palette-white)',
  color: 'var(--palette-black)',
  padding: '12px 20px',
  fontFamily: HOUR_OF_AI_TEXT_FONT_STACK,
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: '148%',
  letterSpacing: 'normal',
  textTransform: 'none',
  '&.Mui-selected, &.Mui-selected:hover': {
    backgroundColor: 'var(--palette-dark-purple)',
    color: 'var(--palette-white)',
  },
  '&.Mui-focusVisible': {
    outline: '2px solid var(--palette-dark-purple)',
    outlineOffset: '2px',
  },
};

/** The Hour of AI catalog's All / Hour of AI / Hour of Code filter. */
const CatalogFilterButtons = ({
  value,
  onChange,
}: {
  value: ActivityType | undefined;
  onChange: (value: ActivityType | undefined) => void;
}) => (
  <Box
    role="group"
    aria-label="Activity catalog"
    sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}
  >
    {OPTIONS.map(option => (
      <ToggleButton
        key={option.label}
        value={option.value ?? 'all'}
        selected={value === option.value}
        onChange={() => onChange(option.value)}
        disableRipple
        sx={BUTTON_SX}
      >
        {option.label}
      </ToggleButton>
    ))}
  </Box>
);

export default CatalogFilterButtons;
