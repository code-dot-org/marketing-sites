import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import {useTheme} from '@mui/material/styles';

import {getModeTextColors, getTierColors} from './theme';
import {StateGapMapDataset, StateGapMapMode, StateGapMapRecord} from './types';
import {
  computeGapPercent,
  formatPercent,
  getTier,
  hasValidUrl,
  isRecordComplete,
} from './utils';

interface StateGapMapPanelProps {
  /** Structured dataset supplies tier labels for the selected record. */
  dataset: StateGapMapDataset;
  inheritedMode?: string | null;
  mode: StateGapMapMode;
  /** Active record for hover preview or locked detail view. */
  stateRecord?: StateGapMapRecord;
  /** Close handler is only passed for locked states. */
  onClose?: () => void;
}

function MetricRow({label, value}: {label: string; value: string}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" sx={{color: 'inherit', opacity: 0.72}}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function StateGapMapPanel({
  dataset,
  inheritedMode,
  mode,
  stateRecord,
  onClose,
}: StateGapMapPanelProps) {
  const theme = useTheme();
  const textColors = getModeTextColors(theme, inheritedMode);
  const tier = stateRecord ? getTier(dataset, stateRecord.tier) : undefined;
  const isComplete = stateRecord ? isRecordComplete(stateRecord) : false;
  const colors = stateRecord
    ? getTierColors(theme, stateRecord.tier, inheritedMode, {
        active: mode !== 'default',
        locked: mode === 'locked',
      })
    : undefined;

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        p: {xs: 1.5, md: 2},
        borderRadius: 3,
        bgcolor: textColors.surface,
        color: textColors.primary,
        backdropFilter: 'blur(12px)',
        boxShadow:
          mode === 'locked'
            ? '0 18px 40px rgba(17, 24, 39, 0.18)'
            : '0 10px 24px rgba(17, 24, 39, 0.12)',
      }}
    >
      <Box sx={{display: 'grid'}}>
        <Box
          aria-hidden="true"
          // This hidden scaffold keeps the mobile stacked layout from jumping
          // when the panel swaps between default, preview, and locked content.
          sx={{
            gridArea: '1 / 1',
            visibility: 'hidden',
            pointerEvents: 'none',
            display: {xs: 'block', lg: 'none'},
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={{xs: 0.75, md: 1}}
          >
            <Stack spacing={{xs: 0.5, md: 0.75}}>
              <Box sx={{height: {xs: 32, md: 40}, width: '70%'}} />
              <Box sx={{height: {xs: 28, md: 32}, width: {xs: 104, md: 116}}} />
            </Stack>
            <Box
              sx={{
                height: {xs: 28, md: 32},
                width: {xs: 28, md: 32},
                flexShrink: 0,
              }}
            />
          </Stack>

          <Divider
            sx={{my: {xs: 1.5, md: 2}, borderColor: textColors.divider}}
          />

          <Stack spacing={{xs: 1, md: 1.25}}>
            <Box sx={{height: {xs: 18, md: 20}, width: '100%'}} />
            <Box sx={{height: {xs: 18, md: 20}, width: '100%'}} />
            <Box sx={{height: {xs: 18, md: 20}, width: '100%'}} />
          </Stack>

          <Stack spacing={{xs: 1, md: 1.25}} sx={{mt: {xs: 1.5, md: 2}}}>
            <Box sx={{height: {xs: 32, md: 36}, width: '100%'}} />
            <Box sx={{height: {xs: 32, md: 36}, width: '100%'}} />
          </Stack>
        </Box>

        <Box sx={{gridArea: '1 / 1'}}>
          {stateRecord ? (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={{xs: 0.75, md: 1}}
              >
                <Stack spacing={{xs: 0.5, md: 0.75}}>
                  <Typography variant="h5" sx={{color: textColors.primary}}>
                    {stateRecord.name}
                  </Typography>
                  <Chip
                    label={tier?.label ?? stateRecord.tier}
                    sx={{
                      alignSelf: 'flex-start',
                      bgcolor: colors?.badgeBg,
                      color: colors?.badgeText,
                    }}
                  />
                </Stack>
                {mode === 'locked' && onClose ? (
                  <IconButton
                    aria-label="Close selected state panel"
                    onClick={onClose}
                    size="small"
                    sx={{color: textColors.primary}}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ) : null}
              </Stack>

              <Divider
                sx={{my: {xs: 1.5, md: 2}, borderColor: textColors.divider}}
              />

              {isComplete ? (
                <Stack spacing={{xs: 1, md: 1.25}}>
                  <MetricRow
                    label="Access"
                    value={formatPercent(stateRecord.accessPercent)}
                  />
                  <MetricRow
                    label="Participation"
                    value={formatPercent(stateRecord.participationPercent)}
                  />
                  <MetricRow
                    label="Gap"
                    value={formatPercent(computeGapPercent(stateRecord))}
                  />
                </Stack>
              ) : (
                <Typography variant="body2" sx={{color: textColors.secondary}}>
                  Data unavailable for this state in the current dataset.
                </Typography>
              )}

              <Box sx={{mt: {xs: 1.5, md: 2}}}>
                {mode === 'locked' &&
                (hasValidUrl(stateRecord.reportUrl) ||
                  hasValidUrl(stateRecord.presentationUrl)) ? (
                  <Stack spacing={{xs: 1, md: 1.25}}>
                    {hasValidUrl(stateRecord.reportUrl) ? (
                      <Button
                        component="a"
                        href={stateRecord.reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        // The icon inherits button text color so light/dark
                        // theme changes do not leave a mismatched default fill.
                        endIcon={<OpenInNewIcon sx={{color: 'inherit'}} />}
                        variant="contained"
                      >
                        Download State Report
                      </Button>
                    ) : null}
                    {hasValidUrl(stateRecord.presentationUrl) ? (
                      <Button
                        component="a"
                        href={stateRecord.presentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        // The icon inherits button text color so light/dark
                        // theme changes do not leave a mismatched default fill.
                        endIcon={<OpenInNewIcon sx={{color: 'inherit'}} />}
                        variant="outlined"
                      >
                        Download Presentation Deck
                      </Button>
                    ) : null}
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{color: textColors.secondary}}
                  >
                    Click or tap this state to view reports.
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <Stack spacing={{xs: 1, md: 1.5}}>
              <Typography variant="h5" sx={{color: textColors.primary}}>
                Select a state
              </Typography>
              <Typography variant="body2" sx={{color: textColors.secondary}}>
                Hover a state to preview its metrics. Click or tap a state to
                download the state report and presentation deck.
              </Typography>
            </Stack>
          )}
        </Box>
      </Box>
    </Card>
  );
}
