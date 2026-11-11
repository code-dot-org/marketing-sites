import Box from '@mui/material/Box';

import {Paragraph} from '@/components/dataDisplay/brandComponents';
import YearBars from '@/components/dataDisplay/chart/YearBars';
import {CODEAI} from '@/components/dataDisplay/codeaiColors';

import {NOT_REPORTED} from '../../constants';
import {formatChange, type StateModel} from '../../readReport';
import {Narrative} from '../common';

export const ACCESS_TITLE =
  'Public High Schools Offering Digital Sciences Courses';

/** Access by school year against the national figure, with the change and narrative. */
export default function AccessCard({
  model,
  size = 'default',
  showNarrative = true,
}: {
  model: Pick<StateModel, 'access' | 'narratives' | 'name'>;
  size?: 'default' | 'print';
  showNarrative?: boolean;
}) {
  const {access} = model;
  const change = formatChange(access.change, '%');
  const isPrint = size === 'print';

  return (
    <Box>
      <Paragraph
        removeMarginBottom={false}
        visualAppearance={isPrint ? 'text-xs' : 'text-sm'}
        isStrong
        sx={{textAlign: 'center'}}
      >
        Access by School Year
      </Paragraph>
      <YearBars
        title={`${model.name}: public high schools offering Digital Sciences courses, by school year`}
        seriesLabel={model.name}
        referenceLabel="National average"
        color={CODEAI.purplePrimary}
        // Scale to the data, not 100%, so the bars reach the title.
        max={Math.max(
          1,
          ...access.series.map(p => p.value ?? 0),
          ...access.series.map(p => access.nationalByYear[p.year] ?? 0),
        )}
        emptyLabel={NOT_REPORTED}
        interactive={!isPrint}
        size={size}
        points={access.series.map(p => ({
          key: p.year,
          label: p.label,
          value: p.value,
          reference: access.nationalByYear[p.year] ?? null,
        }))}
      />
      {change && (
        <Paragraph
          visualAppearance={isPrint ? 'text-xs' : 'text-sm'}
          removeMarginBottom
          sx={{textAlign: 'center', marginTop: '8px'}}
        >
          Year over year: <strong>{change}</strong>
        </Paragraph>
      )}
      {showNarrative && (
        <Narrative text={model.narratives.accessNarrative} size={size} />
      )}
    </Box>
  );
}
