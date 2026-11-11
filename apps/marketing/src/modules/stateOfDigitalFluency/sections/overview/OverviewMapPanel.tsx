'use client';

import Box from '@mui/material/Box';
import {type ReactNode, useState} from 'react';

import {CustomText, Paragraph} from '@/components/dataDisplay/brandComponents';
import {codeaiVar} from '@/components/dataDisplay/codeaiColors';
import FlexColumns from '@/components/dataDisplay/layout/FlexColumns';
import UsMapInteractive, {
  type MapTooltip,
} from '@/components/dataDisplay/map/UsMapInteractive';
import {codeaiRadius} from '@/themes/code.org/constants/radius';

import {GENDER_COLORS, NOT_REPORTED} from '../../constants';
import {PanelHeading, ReportPanel} from '../common';

export interface PanelState {
  name: string;
  score: string;
  /** Omitted for the national figures. */
  rank?: string;
  access: string;
  participation: string;
  gender: {female: number; male: number} | null;
}

export interface OverviewMapPanelProps {
  /** The server-rendered map content. */
  map: ReactNode;
  tooltips: Record<string, MapTooltip>;
  states: Record<string, PanelState>;
  /** Shown when no state is active. */
  national: PanelState;
  /** Server-rendered content under the side panels, such as a link. */
  footer?: ReactNode;
}

function GenderBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '96px 1fr 52px',
        alignItems: 'center',
        gap: 1,
        mb: 1,
      }}
    >
      <Paragraph visualAppearance="text-sm" removeMarginBottom>
        {label}
      </Paragraph>
      <Box
        sx={{
          height: 12,
          background: codeaiVar('gray2'),
          borderRadius: '2px',
        }}
      >
        <Box
          sx={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            height: '100%',
            background: color,
            borderRadius: '2px',
            transition: 'width 200ms ease',
            '@media (prefers-reduced-motion: reduce)': {transition: 'none'},
          }}
        />
      </Box>
      <Paragraph
        visualAppearance="text-sm"
        isStrong
        removeMarginBottom
        sx={{textAlign: 'right'}}
      >
        {value.toFixed(1)}%
      </Paragraph>
    </Box>
  );
}

const FIGURES: {
  key: 'score' | 'rank' | 'access' | 'participation';
  label: string;
  accent?: boolean;
}[] = [
  {key: 'score', label: 'Digital Fluency Index Score', accent: true},
  {key: 'rank', label: 'National Rank'},
  {key: 'access', label: 'HS Access'},
  {key: 'participation', label: 'HS Participation'},
];

/** A state's figures as tiles: two per row, an odd first one full width. */
function FiguresBody({panel}: {panel: PanelState}) {
  const figures = FIGURES.filter(f => panel[f.key] != null);
  return (
    <>
      <PanelHeading size="small">{panel.name}</PanelHeading>
      <Box
        component="dl"
        sx={{display: 'flex', flexWrap: 'wrap', gap: 1.5, m: 0}}
      >
        {figures.map((figure, i) => (
          <Box
            key={figure.key}
            sx={{
              width:
                i === 0 && figures.length % 2
                  ? '100%'
                  : 'calc((100% - 12px) / 2)',
              boxSizing: 'border-box',
              background: codeaiVar('gray1'),
              borderRadius: codeaiRadius('md', '10px'),
              p: 1.5,
              display: 'flex',
              flexDirection: 'column-reverse',
            }}
          >
            <Box component="dt">
              <Paragraph visualAppearance="text-xs" removeMarginBottom>
                {figure.label}
              </Paragraph>
            </Box>
            <Box component="dd" sx={{m: 0}}>
              {panel[figure.key] === NOT_REPORTED ? (
                // The report's empty-value style, as in Stat.
                <Paragraph
                  visualAppearance="text-lg"
                  isItalic
                  color="gray6"
                  removeMarginBottom
                >
                  {NOT_REPORTED}
                </Paragraph>
              ) : (
                <CustomText
                  htmlTag="p"
                  font="display"
                  textSize="xs"
                  fontWeight="700"
                  color={figure.accent ? 'purplePrimary' : 'black'}
                  removeMarginBottom
                >
                  {panel[figure.key]}
                </CustomText>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
}

function GenderBody({
  label,
  gender,
  caption,
}: {
  label: string;
  gender: PanelState['gender'];
  caption: string;
}) {
  return (
    <>
      <PanelHeading size="small">{`Gender Enrollment — ${label}`}</PanelHeading>
      {gender ? (
        <>
          <GenderBar
            label="Young Women"
            value={gender.female}
            color={GENDER_COLORS.female}
          />
          <GenderBar
            label="Young Men"
            value={gender.male}
            color={GENDER_COLORS.male}
          />
        </>
      ) : (
        <Paragraph removeMarginBottom={false} visualAppearance="text-sm">
          {NOT_REPORTED}
        </Paragraph>
      )}
      <Paragraph visualAppearance="text-xs" color="gray6" removeMarginBottom>
        {caption}
      </Paragraph>
    </>
  );
}

/**
 * Holds the space of `ghost`, an invisible worst case, and lays the live
 * content over it at its natural height, so the row below never moves as
 * states change. Spare space falls below the live content.
 */
function Reserve({ghost, children}: {ghost: ReactNode; children: ReactNode}) {
  return (
    <Box sx={{position: 'relative'}}>
      <Box aria-hidden sx={{visibility: 'hidden'}}>
        {ghost}
      </Box>
      <Box sx={{position: 'absolute', top: 0, left: 0, right: 0}}>
        {children}
      </Box>
    </Box>
  );
}

/** The two bordered side panels, stacked. */
function SidePanels({
  figures,
  gender,
}: {
  figures: ReactNode;
  gender: ReactNode;
}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <ReportPanel bordered sx={{p: 2}}>
        {figures}
      </ReportPanel>
      <ReportPanel bordered sx={{p: 2}}>
        {gender}
      </ReportPanel>
    </Box>
  );
}

const NATIONAL_CAPTION = 'National average across all reporting states';
const genderCaption = (name: string) => `${name} enrollment by gender`;

/**
 * The overview map with its linked panels: hovering or focusing a state
 * shows its figures and gender split, and leaving resets to the national view.
 */
export default function OverviewMapPanel({
  map,
  tooltips,
  states,
  national,
  footer,
}: OverviewMapPanelProps) {
  const [active, setActive] = useState<string | null>(null);
  const state = active ? states[active] : undefined;
  const shown = state ?? national;
  const gender = state?.gender ?? national.gender;
  const genderLabel = state?.gender ? state.name : 'National Avg';
  const caption = state?.gender ? genderCaption(state.name) : NATIONAL_CAPTION;

  // The tallest any state can make each panel: the longest name and every
  // figure "Not reported" (both wrap in a half-width tile).
  const longestName = [national, ...Object.values(states)]
    .map(p => p.name)
    .reduce((a, b) => (b.length > a.length ? b : a), '');
  const ghost: PanelState = {
    name: longestName,
    score: NOT_REPORTED,
    rank: NOT_REPORTED,
    access: NOT_REPORTED,
    participation: NOT_REPORTED,
    gender: {female: 50, male: 50},
  };
  const ghostCaption = [NATIONAL_CAPTION, genderCaption(longestName)].reduce(
    (a, b) => (b.length > a.length ? b : a),
  );

  return (
    <FlexColumns
      columns={{xs: 1, md: 2}}
      weights={[2, 1]}
      alignItems="flex-start"
    >
      <ReportPanel sx={{p: 0}}>
        <UsMapInteractive tooltips={tooltips} onActiveChange={setActive}>
          {map}
        </UsMapInteractive>
      </ReportPanel>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <Reserve
          ghost={
            <SidePanels
              figures={<FiguresBody panel={ghost} />}
              gender={
                <GenderBody
                  label={longestName}
                  gender={ghost.gender}
                  caption={ghostCaption}
                />
              }
            />
          }
        >
          <SidePanels
            figures={
              <Box aria-live="polite">
                <FiguresBody panel={shown} />
              </Box>
            }
            gender={
              <GenderBody
                label={genderLabel}
                gender={gender}
                caption={caption}
              />
            }
          />
        </Reserve>
        {footer}
      </Box>
    </FlexColumns>
  );
}
