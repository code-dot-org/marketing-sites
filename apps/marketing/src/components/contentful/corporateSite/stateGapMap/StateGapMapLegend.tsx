import {Box, Stack, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';

import {getModeTextColors, getTierColors} from './theme';
import {StateGapMapDataset} from './types';

interface StateGapMapLegendProps {
  dataset: StateGapMapDataset;
  inheritedMode?: string | null;
}

export default function StateGapMapLegend({
  dataset,
  inheritedMode,
}: StateGapMapLegendProps) {
  const theme = useTheme();
  const textColors = getModeTextColors(theme, inheritedMode);

  return (
    <Stack
      direction={{xs: 'column', sm: 'row'}}
      spacing={1.5}
      useFlexGap
      flexWrap="wrap"
      aria-label="Policy tier legend"
    >
      {dataset.tiers.map(tier => {
        const colors = getTierColors(theme, tier.id, inheritedMode);

        return (
          <Stack key={tier.id} direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: 999,
                bgcolor: colors.fill,
                border: `1px solid ${colors.stroke}`,
              }}
            />
            <Typography variant="body2" sx={{color: textColors.primary}}>
              {tier.label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
