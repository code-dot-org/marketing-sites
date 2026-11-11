import Box from '@mui/material/Box';

import Badge from '@/components/contentful/badge/Badge';
import {
  CustomText,
  Heading,
  Paragraph,
} from '@/components/dataDisplay/brandComponents';
import YearBars from '@/components/dataDisplay/chart/YearBars';
import {CODEAI, codeaiVar} from '@/components/dataDisplay/codeaiColors';
import FlexColumns from '@/components/dataDisplay/layout/FlexColumns';
import Stat from '@/components/dataDisplay/stat/Stat';
import {textCell} from '@/components/dataDisplay/typeScale';
import {codeaiRadius} from '@/themes/code.org/constants/radius';

import {
  HIGHLIGHTS,
  NOT_REPORTED,
  POLICY_KEYS,
  POLICY_LABELS,
} from '../../constants';
import type {NationalModel, OverviewModel} from '../../readReport';
import {ReportPanel, ReportSection} from '../common';

const tile = {
  background: codeaiVar('white'),
  borderRadius: codeaiRadius('md', '10px'),
} as const;

function PolicyLandscape({
  counts,
  stateCount,
}: {
  counts: NationalModel['policyCounts'];
  stateCount: number;
}) {
  return (
    <ReportSection
      title="Digital Sciences Policy Landscape"
      titleColor="purpleDark"
      centerHeader
      intro={`States with each policy at the Developing tier or above, out of ${stateCount} (the 50 states and DC).`}
      introSize="regular"
      background="blueLight"
    >
      <FlexColumns
        component="ul"
        aria-label="States with each policy"
        columns={{xs: 1, md: 2}}
      >
        {POLICY_KEYS.map(key => {
          const count = counts[key];
          return (
            <Box
              component="li"
              key={key}
              sx={{
                ...tile,
                px: 3,
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Paragraph
                visualAppearance="text-md"
                removeMarginBottom
                sx={{fontWeight: 500}}
              >
                {POLICY_LABELS[key]}
              </Paragraph>
              {count == null ? (
                <Paragraph
                  visualAppearance="text-sm"
                  isItalic
                  color="gray6"
                  removeMarginBottom
                  sx={{flexShrink: 0, fontWeight: 500}}
                >
                  {NOT_REPORTED}
                </Paragraph>
              ) : (
                <CustomText
                  htmlTag="p"
                  font="display"
                  textSize="xs"
                  fontWeight="700"
                  color="purplePrimary"
                  removeMarginBottom
                >
                  {count}
                  <Box
                    component="span"
                    sx={{typography: 'body2', fontWeight: 600, color: 'black'}}
                  >
                    {` of ${stateCount}`}
                  </Box>
                </CustomText>
              )}
            </Box>
          );
        })}
      </FlexColumns>
    </ReportSection>
  );
}

function Trends({
  national,
  stats,
}: {
  national: NationalModel;
  stats: OverviewModel['stats'];
}) {
  return (
    <ReportSection
      title="Trends in Computer Science Education"
      titleColor="purpleDark"
      centerHeader
    >
      <FlexColumns columns={{xs: 1, md: 2}} weights={[2, 1]}>
        <ReportPanel bordered>
          <Paragraph
            removeMarginBottom
            visualAppearance="text-md"
            isStrong
            sx={{textAlign: 'center', marginBottom: '16px'}}
          >
            National Average High School CS Access
          </Paragraph>
          <YearBars
            title="National high school CS access by school year"
            seriesLabel="National"
            color={CODEAI.purplePrimary}
            // Scale to the data, not 100%, so the bars reach the title.
            max={Math.max(1, ...national.accessSeries.map(p => p.value ?? 0))}
            tooltip={false}
            emptyLabel={NOT_REPORTED}
            points={national.accessSeries.map(p => ({
              key: p.year,
              label: p.label,
              value: p.value,
            }))}
          />
        </ReportPanel>
        <ReportPanel
          bordered
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Stat
            label={'Avg HS Participation\nin Digital Sciences'}
            value={stats.participation}
            unit="%"
            emptyLabel={NOT_REPORTED}
            layout="centered"
            size="medium"
          />
          <Stat
            label={'National Avg\nHS Access'}
            value={stats.access}
            unit="%"
            digits={0}
            emptyLabel={NOT_REPORTED}
            layout="centered"
            size="medium"
          />
          <Stat
            label={'National Avg Digital Fluency\nIndex Score'}
            value={stats.averageScore}
            max={100}
            emptyLabel={NOT_REPORTED}
            layout="centered"
            size="medium"
          />
        </ReportPanel>
      </FlexColumns>
    </ReportSection>
  );
}

function Highlights() {
  return (
    <ReportSection
      title="Digital Sciences Highlights"
      titleColor="purpleDark"
      centerHeader
      background="purpleLight"
    >
      <FlexColumns
        component="ul"
        aria-label="State highlights"
        columns={{xs: 1, sm: 2, lg: 4}}
      >
        {HIGHLIGHTS.map(h => (
          <Box
            component="li"
            key={h.state}
            sx={{
              ...tile,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <Badge
              text={h.tag}
              color="purple"
              size="small"
              appearance="light"
            />
            <Heading
              visualAppearance="heading-lg"
              color="purpleDark"
              {...textCell('xl')}
              removeMarginBottom
            >
              {h.state}
            </Heading>
            <Paragraph visualAppearance="text-md" isStrong removeMarginBottom>
              {h.headline}
            </Paragraph>
            <Paragraph visualAppearance="text-sm" removeMarginBottom>
              {h.body}
            </Paragraph>
          </Box>
        ))}
      </FlexColumns>
    </ReportSection>
  );
}

/** The overview's national sections: policy landscape, trends, highlights. */
export default function OverviewNational({
  national,
  stats,
  stateCount,
}: {
  national: NationalModel;
  stats: OverviewModel['stats'];
  stateCount: number;
}) {
  return (
    <>
      <PolicyLandscape counts={national.policyCounts} stateCount={stateCount} />
      <Trends national={national} stats={stats} />
      <Highlights />
    </>
  );
}
