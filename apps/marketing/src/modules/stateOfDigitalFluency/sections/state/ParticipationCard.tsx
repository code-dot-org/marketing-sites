import Box from '@mui/material/Box';

import {
  CustomText,
  Divider,
  Heading,
  Paragraph,
} from '@/components/dataDisplay/brandComponents';
import Pie from '@/components/dataDisplay/chart/Pie';
import {textCell} from '@/components/dataDisplay/typeScale';

import {GENDER_COLORS, NOT_REPORTED} from '../../constants';
import {formatChange, type StateModel} from '../../readReport';
import {Narrative} from '../common';

export const PARTICIPATION_TITLE =
  'HS Student Participation in Digital Sciences Courses';

function Note({children}: {children: string}) {
  return (
    <Paragraph
      visualAppearance="text-xs"
      color="gray6"
      removeMarginBottom
      sx={{marginTop: '12px'}}
    >
      {children}
    </Paragraph>
  );
}

/** Participation, the gender split, the national benchmarks and the senior cohort. */
export default function ParticipationCard({
  model,
  size = 'default',
  showNarrative = true,
  showSeniorCohort = true,
}: {
  model: Pick<
    StateModel,
    'participation' | 'seniorCohort' | 'narratives' | 'name'
  >;
  size?: 'default' | 'print';
  showNarrative?: boolean;
  showSeniorCohort?: boolean;
}) {
  const {participation, seniorCohort} = model;
  const isPrint = size === 'print';
  const statSize = isPrint ? 1.25 : undefined;
  const narrative = showNarrative && (
    <Narrative text={model.narratives.participationNarrative} size={size} />
  );

  if (participation.totalPct == null) {
    return (
      <Box>
        <Paragraph
          removeMarginBottom={false}
          visualAppearance="text-md"
          color="gray6"
        >
          Participation data not yet available for this state.
        </Paragraph>
        {narrative}
      </Box>
    );
  }

  const change = formatChange(participation.change, '%');
  const gender = participation.gender;
  const national = participation.nationalGender;
  const nationalGenderParts = [
    national.female != null && `${Math.round(national.female)}% Women`,
    national.male != null && `${Math.round(national.male)}% Men`,
  ].filter(Boolean);

  return (
    <Box>
      <CustomText
        type="statistic"
        htmlTag="p"
        fontSize={statSize}
        lineHeight={isPrint ? 1.2 : undefined}
        removeMarginBottom
      >
        {participation.totalPct.toFixed(1)}%
      </CustomText>
      <Paragraph
        removeMarginBottom={false}
        visualAppearance={isPrint ? 'text-xs' : 'text-lg'}
      >
        of all high school students enrolled in at least one Digital Sciences
        course
        {participation.yearLabel
          ? ` during the ${participation.yearLabel} school year`
          : ''}
        .{change && ` (${change} year over year)`}
      </Paragraph>
      {participation.national != null && (
        <Paragraph
          visualAppearance={isPrint ? 'text-xs' : 'text-sm'}
          removeMarginBottom
        >
          <strong>National average:</strong> {participation.national.toFixed(1)}
          %
        </Paragraph>
      )}
      {narrative}
      {gender && (
        <>
          <Divider color="gray3" margin={isPrint ? 'xs' : 'm'} />
          <Pie
            title={`${model.name}: high school Digital Sciences enrollment by gender`}
            emptyLabel={NOT_REPORTED}
            size={size}
            slices={[
              {
                key: 'female',
                label: 'Young Women',
                value: gender.female,
                color: GENDER_COLORS.female,
              },
              {
                key: 'male',
                label: 'Young Men',
                value: gender.male,
                color: GENDER_COLORS.male,
              },
              ...(gender.other != null
                ? [
                    {
                      key: 'other',
                      label: 'Other',
                      value: gender.other,
                      color: GENDER_COLORS.other,
                    },
                  ]
                : []),
            ]}
          />
          {nationalGenderParts.length > 0 && (
            <Paragraph
              visualAppearance={isPrint ? 'text-xs' : 'text-sm'}
              removeMarginBottom
              sx={{textAlign: 'center', marginTop: '8px'}}
            >
              <strong>National average:</strong>{' '}
              {nationalGenderParts.join(' · ')}
            </Paragraph>
          )}
        </>
      )}
      {/* Print drops the footnote so the profile fits one sheet. */}
      {!isPrint && (
        <Note>
          Data reflects current-year high school enrollment. Percentages are
          non-duplicative within course type; the total above counts each
          student only once.
        </Note>
      )}
      {showSeniorCohort && seniorCohort && (
        <>
          <Divider color="gray3" margin="m" />
          <Heading
            removeMarginBottom={false}
            visualAppearance="heading-md"
            {...textCell('lg')}
          >
            Senior Cohort: Career-Long Digital Sciences Exposure
          </Heading>
          <CustomText type="statistic" htmlTag="p" removeMarginBottom>
            {seniorCohort.totalPct.toFixed(1)}%
          </CustomText>
          <Paragraph removeMarginBottom={false} visualAppearance="text-lg">
            of the graduating class
            {seniorCohort.yearLabel ? ` of ${seniorCohort.yearLabel}` : ''} took
            at least one Digital Sciences course during their high school
            career.
          </Paragraph>
          {seniorCohort.femalePct != null && (
            <Paragraph visualAppearance="text-sm" removeMarginBottom>
              Young women made up{' '}
              <strong>{seniorCohort.femalePct.toFixed(1)}%</strong> of those
              students.
            </Paragraph>
          )}
          <Note>
            Senior cohort data reflects the graduating class&apos;s complete
            high school course history. Percentages are non-duplicative.
          </Note>
        </>
      )}
    </Box>
  );
}
