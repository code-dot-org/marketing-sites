import Box from '@mui/material/Box';

import Scale from '@/components/dataDisplay/scale/Scale';

import {
  NOT_REPORTED,
  TIER_BADGES,
  TIER_LABELS,
  TIER_SEGMENTS,
} from '../../constants';
import type {StateModel} from '../../readReport';
import {Narrative} from '../common';

export const POLICY_TITLE = 'Policies for Digital Sciences Education';

/** The ten policies by group, then the intent and recommendation narratives. */
export default function PolicyCard({
  model,
  size = 'default',
  showNarratives = true,
}: {
  model: Pick<StateModel, 'policyGroups' | 'narratives'>;
  size?: 'default' | 'print';
  showNarratives?: boolean;
}) {
  return (
    <Box>
      <Scale
        size={size}
        emptyLabel={NOT_REPORTED}
        groups={model.policyGroups.map(group => ({
          label: group.label,
          items: group.items.map(item => ({
            key: item.key,
            label: item.label,
            segments: item.tier
              ? TIER_SEGMENTS[item.tier]
              : [null, null, null, null, null],
            levelLabel: item.tier ? TIER_LABELS[item.tier] : null,
            badge: item.tier ? TIER_BADGES[item.tier] : 'black',
          })),
        }))}
      />
      {showNarratives && (
        <Box sx={{mt: size === 'print' ? 1 : 3}}>
          <Narrative text={model.narratives.aiPolicyIntent} size={size} />
          <Narrative
            text={model.narratives.aiPolicyRecommendation}
            size={size}
          />
        </Box>
      )}
    </Box>
  );
}
