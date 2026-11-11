import Box from '@mui/material/Box';

import type {BrandColor} from '@/components/common/colors';
import Badge from '@/components/contentful/badge/Badge';
import {SectionBackgroundProvider} from '@/components/contentful/section/SectionBackgroundContext';
import {
  CustomText,
  Heading,
  Link,
  Paragraph,
  Section,
} from '@/components/dataDisplay/brandComponents';
import {
  type CodeaiColor,
  codeaiVar,
} from '@/components/dataDisplay/codeaiColors';
import FlexColumns from '@/components/dataDisplay/layout/FlexColumns';
import Stat from '@/components/dataDisplay/stat/Stat';
import StatGroup from '@/components/dataDisplay/stat/StatGroup';
import {displayCell, textCell} from '@/components/dataDisplay/typeScale';
import {codeaiRadius} from '@/themes/code.org/constants/radius';

import {
  NOT_REPORTED,
  TIER_FAMILIES,
  TIER_SECTION_BACKGROUNDS,
  UNSCORED_SECTION_BACKGROUND,
} from '../../constants';
import {formatChange, formatScore, type StateModel} from '../../readReport';
import {PrintBand} from '../print/PrintLayout';

const COMPONENTS: {
  key: keyof StateModel['score'];
  label: string;
  max: number;
}[] = [
  {key: 'policy', label: 'Policy Maturity', max: 45},
  {key: 'access', label: 'Access Availability', max: 12},
  {key: 'participation', label: 'Participation', max: 18},
  {key: 'momentum', label: 'Momentum', max: 15},
  {key: 'leadership', label: 'Leadership', max: 10},
];

export const scoreBackground = (
  score: StateModel['score'],
): BrandColor & CodeaiColor =>
  score.tierLabel
    ? TIER_SECTION_BACKGROUNDS[score.tierLabel]
    : UNSCORED_SECTION_BACKGROUND;

/** The printable score band's content. Expects a dark background. */
function ScoreContentPrint({score}: {score: StateModel['score']}) {
  const change = formatChange(score.change, ' pts');

  return (
    <Box
      component="section"
      aria-labelledby="sodf-score-heading"
      sx={{display: 'flex', columnGap: 3, alignItems: 'flex-start'}}
    >
      <Box sx={{flex: '0 0 auto'}}>
        {score.total == null ? (
          <Paragraph visualAppearance="text-xl" isItalic removeMarginBottom>
            {NOT_REPORTED}
          </Paragraph>
        ) : (
          <>
            <CustomText
              type="statistic"
              htmlTag="p"
              color="white"
              {...displayCell('md')}
              removeMarginBottom
            >
              {formatScore(score.total)}
            </CustomText>
            <Paragraph visualAppearance="text-xs" removeMarginBottom>
              out of 100
            </Paragraph>
          </>
        )}
        {score.tierLabel && (
          <Box sx={{mt: 0.5}}>
            <Badge
              text={score.tierLabel}
              color={TIER_FAMILIES[score.tierLabel]}
              size="small"
              appearance="light"
            />
          </Box>
        )}
      </Box>
      <Box sx={{flex: 1, minWidth: 0}}>
        <Heading
          visualAppearance="heading-xl"
          {...textCell('md')}
          removeMarginBottom
        >
          <span id="sodf-score-heading">Digital Fluency Index Score</span>
        </Heading>
        <Paragraph removeMarginBottom={false} visualAppearance="text-xs">
          Composite index tracking policy maturity, access, participation,
          momentum, and leadership commitment to Digital Sciences.
        </Paragraph>
        <Box sx={{mt: 1}}>
          <StatGroup label="Score components" columns={5}>
            {COMPONENTS.map(c => (
              <Stat
                key={c.key}
                label={c.label}
                value={score[c.key] as number | null}
                max={c.max}
                emptyLabel={NOT_REPORTED}
                color="white"
                size="print"
              />
            ))}
          </StatGroup>
        </Box>
        {change && (
          <Paragraph
            visualAppearance="text-sm"
            removeMarginBottom
            sx={{marginTop: '16px'}}
          >
            Year over year: <strong>{change}</strong>
          </Paragraph>
        )}
      </Box>
    </Box>
  );
}

/** Screen layout: header beside the score, then the components in a row. */
function ScoreContentScreen({
  score,
  methodologyHref,
}: {
  score: StateModel['score'];
  methodologyHref: string;
}) {
  const change = formatChange(score.change, ' pts');

  return (
    <Box
      component="section"
      aria-labelledby="sodf-score-heading"
      sx={{display: 'flex', flexDirection: 'column', gap: 6}}
    >
      <FlexColumns
        columns={{xs: 1, md: 2}}
        weights={[3, 2]}
        alignItems="center"
      >
        <Box>
          <Heading visualAppearance="heading-xl" removeMarginBottom={false}>
            <span id="sodf-score-heading">Digital Fluency Index Score</span>
          </Heading>
          <Paragraph visualAppearance="text-md" removeMarginBottom={false}>
            Composite index tracking policy maturity, access, participation,
            momentum, and leadership commitment to Digital Sciences.
          </Paragraph>
          <Link
            removeMarginBottom
            href={methodologyHref}
            isLinkExternal={false}
            icon="angle-right"
            size="s"
          >
            How is this scored?
          </Link>
        </Box>
        {/* A white card; the score is Purple Dark for every state. */}
        <Box>
          <Box
            sx={{
              width: 'fit-content',
              mx: 'auto',
              p: 4,
              background: codeaiVar('white'),
              borderRadius: codeaiRadius('md', '10px'),
              textAlign: 'center',
            }}
          >
            <SectionBackgroundProvider value="white">
              {score.total == null ? (
                <Paragraph
                  visualAppearance="text-xl"
                  isItalic
                  removeMarginBottom
                >
                  {NOT_REPORTED}
                </Paragraph>
              ) : (
                <>
                  <CustomText
                    type="statistic"
                    htmlTag="p"
                    color="purpleDark"
                    textSize="2xl"
                    removeMarginBottom
                  >
                    {formatScore(score.total)}
                  </CustomText>
                  <Paragraph
                    visualAppearance="text-md"
                    color="purpleDark"
                    removeMarginBottom
                  >
                    out of 100
                  </Paragraph>
                </>
              )}
              {score.tierLabel && (
                <Box sx={{mt: 2}}>
                  <Badge
                    text={score.tierLabel}
                    color="purple"
                    size="medium"
                    appearance="light"
                  />
                </Box>
              )}
              {change && (
                <Paragraph
                  visualAppearance="text-md"
                  color="purpleDark"
                  removeMarginBottom
                  sx={{marginTop: '16px'}}
                >
                  Year over year: <strong>{change}</strong>
                </Paragraph>
              )}
            </SectionBackgroundProvider>
          </Box>
        </Box>
      </FlexColumns>
      <Box>
        <StatGroup label="Score components" columns={5} wideFrom="lg" spread>
          {COMPONENTS.map(c => (
            <Stat
              key={c.key}
              label={c.label}
              value={score[c.key] as number | null}
              max={c.max}
              emptyLabel={NOT_REPORTED}
              layout="centered"
              size="medium"
            />
          ))}
        </StatGroup>
      </Box>
    </Box>
  );
}

/** The score band on the state page, on Purple Dark like the overview's stats. */
export default function ScoreHero({
  score,
  methodologyHref,
}: {
  score: StateModel['score'];
  methodologyHref: string;
}) {
  return (
    <Section background="purpleDark" padding="l">
      <ScoreContentScreen score={score} methodologyHref={methodologyHref} />
    </Section>
  );
}

/** The same content on a rounded band, for the printable report. */
export function PrintScoreBand({score}: {score: StateModel['score']}) {
  return (
    <PrintBand background={scoreBackground(score)}>
      <ScoreContentPrint score={score} />
    </PrintBand>
  );
}
