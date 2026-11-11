import Box from '@mui/material/Box';

import {CustomText} from '@/components/dataDisplay/brandComponents';
import Pie from '@/components/dataDisplay/chart/Pie';
import YearBars from '@/components/dataDisplay/chart/YearBars';
import {CODEAI} from '@/components/dataDisplay/codeaiColors';
import {flexColumnsSx} from '@/components/dataDisplay/layout/FlexColumns';

import {
  BANDS,
  GENDER_COLORS,
  HIGHLIGHTS,
  NOT_REPORTED,
  POLICY_KEYS,
  POLICY_LABELS,
  REPORT_TITLE,
} from '../../constants';
import {overviewPath} from '../../paths';
import {formatPercent, formatScore, type NationalModel} from '../../readReport';

import PrintLayout, {
  PageTitle,
  PrintBand,
  PrintPage,
  PrintPanel,
  printTile as tile,
  Small,
} from './PrintLayout';

const EDITION = 'National';

/** The map's band fills, as named colors so the text contrast-switches. */
const BAND_BACKGROUNDS = {
  '81-100': 'purplePrimary',
  '51-80': 'purpleMid',
  '0-50': 'purpleLight',
} as const;

/** The 2-page printable national report, matching the prototype's national.html. */
export default function NationalPrintReport({
  national,
  stateCount,
  dataAsOf,
  locale,
}: {
  national: NationalModel;
  stateCount: number;
  dataAsOf: string | null;
  locale: string;
}) {
  const average =
    national.averageScore == null
      ? NOT_REPORTED
      : `${formatScore(national.averageScore)} / 100`;

  return (
    <PrintLayout
      back={{href: overviewPath(locale), label: 'Back to all states'}}
    >
      {/* 1 · Scores and policy */}
      <PrintPage
        label="Page 1 · National Overview"
        edition={EDITION}
        dataAsOf={dataAsOf}
      >
        <PageTitle
          level="h1"
          overline={`National Overview${national.yearLabel ? ` · ${national.yearLabel}` : ''}`}
          title={`${REPORT_TITLE} Report`}
          aside={<Small>code.org/advocacy</Small>}
        />
        <PrintPanel title="Score Distribution">
          <Small>
            National average Digital Fluency Index Score:{' '}
            <strong>{average}</strong>
          </Small>
          <Box
            component="ul"
            aria-label="States by score band"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              mt: 1.5,
              ...flexColumnsSx(3, 1.5),
            }}
          >
            {BANDS.map(b => (
              <li key={b.band}>
                <PrintBand background={BAND_BACKGROUNDS[b.band]}>
                  <Box sx={{textAlign: 'center'}}>
                    <CustomText
                      type="statistic"
                      htmlTag="p"
                      fontSize={1.75}
                      lineHeight={1.1}
                      removeMarginBottom
                    >
                      {national.bandCounts[b.band] ?? NOT_REPORTED}
                    </CustomText>
                    <Small>States scoring {b.label}</Small>
                  </Box>
                </PrintBand>
              </li>
            ))}
          </Box>
        </PrintPanel>
        <PrintPanel title="Digital Sciences Policy Landscape">
          <Small>
            States with each policy at the Developing tier or above, out of{' '}
            {stateCount} (the 50 states and DC).
          </Small>
          <Box
            component="ul"
            aria-label="States with each policy"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              mt: 1.5,
              ...flexColumnsSx(2, 1),
            }}
          >
            {POLICY_KEYS.map(key => {
              const count = national.policyCounts[key];
              return (
                <Box
                  component="li"
                  key={key}
                  sx={{
                    ...tile,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Small>{POLICY_LABELS[key]}</Small>
                  <Small strong>
                    {count == null ? NOT_REPORTED : `${count} of ${stateCount}`}
                  </Small>
                </Box>
              );
            })}
          </Box>
        </PrintPanel>
      </PrintPage>

      {/* 2 · Trends, gender and highlights */}
      <PrintPage
        label="Page 2 · National Trends & Highlights"
        edition={EDITION}
        dataAsOf={dataAsOf}
      >
        <PrintPanel title="Trends in Computer Science Education">
          <YearBars
            title="National high school CS access by school year"
            seriesLabel="National"
            color={CODEAI.purplePrimary}
            max={Math.max(1, ...national.accessSeries.map(p => p.value ?? 0))}
            emptyLabel={NOT_REPORTED}
            interactive={false}
            size="print"
            points={national.accessSeries.map(p => ({
              key: p.year,
              label: p.label,
              value: p.value,
            }))}
          />
          <Box sx={{mt: 1}}>
            <Small center>
              Avg HS Participation in Digital Sciences:{' '}
              <strong>{formatPercent(national.participation)}</strong> ·
              National avg access:{' '}
              <strong>{formatPercent(national.access, 0)}</strong> · National
              avg score: <strong>{average}</strong>
            </Small>
          </Box>
        </PrintPanel>
        <PrintPanel
          title={`Participation by Gender${national.yearLabel ? `, ${national.yearLabel}` : ''}`}
        >
          <Pie
            title="National high school Digital Sciences enrollment by gender"
            emptyLabel={NOT_REPORTED}
            size="print"
            slices={[
              {
                key: 'female',
                label: 'Young Women',
                value: national.gender.female,
                color: GENDER_COLORS.female,
              },
              {
                key: 'male',
                label: 'Young Men',
                value: national.gender.male,
                color: GENDER_COLORS.male,
              },
            ]}
          />
        </PrintPanel>
        <PrintPanel title="Digital Sciences Highlights">
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              ...flexColumnsSx(2, 1.5),
            }}
          >
            {HIGHLIGHTS.map(h => (
              <Box component="li" key={h.state} sx={tile}>
                <Small strong>{h.state}</Small>
                <CustomText
                  type="overline"
                  htmlTag="p"
                  color="purplePrimary"
                  fontSize={0.625}
                  removeMarginBottom
                >
                  {h.tag}
                </CustomText>
                <Box sx={{mt: 0.5}}>
                  <Small strong>{h.headline}</Small>
                </Box>
                <Box sx={{mt: 0.5}}>
                  <Small>{h.body}</Small>
                </Box>
              </Box>
            ))}
          </Box>
        </PrintPanel>
      </PrintPage>
    </PrintLayout>
  );
}
