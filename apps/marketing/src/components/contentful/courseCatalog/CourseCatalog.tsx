'use client';

import {styled, Theme} from '@mui/material/styles';
import React, {useMemo, useState} from 'react';

import {BadgeColor} from '@/components/contentful/badge/Badge';
import {UnitTitleColor} from '@/components/contentful/unitCard';
import {
  gradeRangesOverlap,
  parseGradeSpan,
} from '@/components/contentful/unitCard/mergeGradeBands';
import UnitCarousel, {
  CourseUnitEntry,
} from '@/components/contentful/unitCarousel';
import {resolveContentfulLink} from '@/contentful/resolveLink';
import {
  SECTION_MAX_WIDTH,
  SECTION_PADDING_INLINE,
  SECTION_PADDING_INLINE_MOBILE,
} from '@/themes/code.org/constants';
import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {CODE_ORG_TEXT_FONT_STACK} from '@/themes/code.org/typography/fontStack';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';

const COURSE_CONTENT_TYPE_ID = 'course';

const ALL_GRADES_ID = 'all';

type GradeRange = readonly [number, number];

const GRADE_BAND_FILTERS: {
  id: string;
  label: string;
  range: GradeRange;
}[] = [
  {id: 'k-5', label: 'Grades K-5', range: [0, 5]},
  {id: '6-8', label: 'Grades 6-8', range: [6, 8]},
  {id: '9-12', label: 'Grades 9-12', range: [9, 12]},
];

type CourseFields = {
  title?: string;
  // References arrive from the Experiences entity store as unresolved
  // {sys: {type: 'Link'}} stubs — resolved via resolveContentfulLink.
  secondaryLinkRef?: LinkEntry;
  grade?: string[];
  courseUnits?: CourseUnitEntry[];
};

export type CourseEntry = Entry<CourseFields>;

export interface CourseCatalogProps {
  /** Course entries to display, one Unit Carousel section each */
  courses?: CourseEntry[];
  /** Whether to render the unit count in every carousel subtitle */
  showUnitCount?: boolean;
  /** Whether to render the topics row on every card */
  showTopics?: boolean;
  /** Badge color applied to every topic on every card */
  topicBadgeColor?: BadgeColor;
  /** Overrides every card's Link entry label; empty uses the entry labels */
  linkTextOverride?: string;
  /** Title color applied to every card's unit title */
  unitTitleColor?: UnitTitleColor;
  /** Heading color applied to every carousel's course title */
  headingColor?: UnitTitleColor;
  /** Injected by Contentful Studio via enableEditorProperties */
  isEditorMode?: boolean;
  /** Custom classname */
  className?: string;
  /** Catalog Interstitial components dropped in Contentful Studio */
  children?: React.ReactNode;
}

const Root = styled('div')({
  width: '100%',
});

// The catalog renders full-bleed (so interstitials can span the viewport);
// the filter row and each course section constrain themselves to the site's
// standard content width instead.
const contentWidth = (theme: Theme) => ({
  width: '100%',
  maxWidth: SECTION_MAX_WIDTH,
  marginInline: 'auto',
  paddingInline: SECTION_PADDING_INLINE,
  [theme.breakpoints.down('sm')]: {
    paddingInline: SECTION_PADDING_INLINE_MOBILE,
  },
});

// Row holding the filter bar (left) with room for future siblings (right).
const FilterRow = styled('div')(({theme}) => ({
  ...contentWidth(theme),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  marginBottom: '32px',
}));

const FilterBar = styled('div')({
  display: 'inline-flex',
  // Pills wrap onto extra rows instead of running out of small viewports.
  flexWrap: 'wrap',
  gap: '4px',
  padding: '4px',
  backgroundColor: 'var(--codeai-gray-1, #f2f2f2)',
  border: '1px solid var(--codeai-gray-2, #e4e6e9)',
  borderRadius: codeaiRadius('md', '0.625rem'),
});

const FilterPill = styled('button')(({theme}) => ({
  height: '44px',
  padding: '8px 12px',
  border: '1px solid transparent',
  borderRadius: codeaiRadius('sm', '0.5rem'),
  backgroundColor: 'transparent',
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '1rem',
  lineHeight: '1.5rem',
  fontWeight: 600,
  color: 'var(--codeai-gray-6, #5f6872)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  [theme.breakpoints.down('sm')]: {
    height: '36px',
    padding: '6px 10px',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  '&[aria-pressed="true"]': {
    backgroundColor: '#ffffff',
    border: '1px solid var(--codeai-gray-2, #e4e6e9)',
    boxShadow: '0 1px 2px rgba(10, 13, 18, 0.05)',
    color: 'var(--codeai-gray-8, #292f36)',
  },
  '&:hover:not([aria-pressed="true"]):not([aria-disabled="true"])': {
    color: 'var(--codeai-gray-8, #292f36)',
  },
  '&[aria-disabled="true"]': {
    cursor: 'default',
  },
}));

const EditorHint = styled('p')(({theme}) => ({
  ...contentWidth(theme),
  marginTop: '-24px',
  marginBottom: '32px',
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  color: 'var(--codeai-gray-6, #5f6872)',
}));

// Flex column so course sections and interstitials interleave via CSS order:
// courses get (i+1)*10 by filtered index, interstitials position*10+5.
const CoursesAndChildren = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '48px',
});

const CourseSection = styled('div')(({theme}) => contentWidth(theme));

const courseMatchesBand = (
  grades: string[] | undefined,
  range: GradeRange,
): boolean =>
  (grades ?? []).some(value => {
    const span = parseGradeSpan(value);
    return Boolean(span && gradeRangesOverlap(span, range));
  });

const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  showUnitCount = true,
  showTopics = true,
  topicBadgeColor = 'purple',
  linkTextOverride = 'Explore',
  unitTitleColor = 'black',
  headingColor = 'black',
  isEditorMode,
  className,
  children,
}) => {
  const [selectedBand, setSelectedBand] = useState(ALL_GRADES_ID);

  const sections = useMemo(
    () =>
      (courses ?? [])
        .filter(
          course =>
            course?.sys?.contentType?.sys?.id === COURSE_CONTENT_TYPE_ID,
        )
        .map(({sys, fields}) => ({
          id: sys.id,
          grades: fields.grade,
          carouselProps: {
            title: fields.title,
            courseDetailsLink: resolveContentfulLink<LinkEntry>(
              fields.secondaryLinkRef,
            ),
            gradeBands: fields.grade,
            units: (fields.courseUnits ?? [])
              .map(unit => resolveContentfulLink<CourseUnitEntry>(unit))
              .filter((unit): unit is CourseUnitEntry => Boolean(unit)),
            showUnitCount,
            showTopics,
            topicBadgeColor,
            linkTextOverride,
            unitTitleColor,
            headingColor,
          },
        })),
    [
      courses,
      showUnitCount,
      showTopics,
      topicBadgeColor,
      linkTextOverride,
      unitTitleColor,
      headingColor,
    ],
  );

  // Show placeholder text until content entries are bound
  if (!sections.length) {
    return (
      <>
        <em>
          <strong>📚 Course Catalog placeholder.</strong> Please bind "Course"
          content type entries in the Content sidebar.
        </em>
        {children}
      </>
    );
  }

  // Only offer bands that at least one course matches.
  const visibleBands = GRADE_BAND_FILTERS.filter(band =>
    sections.some(section => courseMatchesBand(section.grades, band.range)),
  );

  const activeBand = GRADE_BAND_FILTERS.find(band => band.id === selectedBand);
  const visibleSections =
    isEditorMode || !activeBand
      ? sections
      : sections.filter(section =>
          courseMatchesBand(section.grades, activeBand.range),
        );

  const selectBand = (id: string) =>
    isEditorMode ? undefined : setSelectedBand(id);

  return (
    <Root className={className}>
      <FilterRow>
        <FilterBar role="group" aria-label="Filter courses by grade">
          {[{id: ALL_GRADES_ID, label: 'All Grades'}, ...visibleBands].map(
            band => (
              <FilterPill
                key={band.id}
                type="button"
                aria-pressed={selectedBand === band.id}
                aria-disabled={isEditorMode || undefined}
                onClick={() => selectBand(band.id)}
              >
                {band.label}
              </FilterPill>
            ),
          )}
        </FilterBar>
      </FilterRow>
      {isEditorMode && (
        <EditorHint>Filtering is disabled in the editor</EditorHint>
      )}
      <CoursesAndChildren>
        {visibleSections.map((section, index) => (
          <CourseSection key={section.id} style={{order: (index + 1) * 10}}>
            <UnitCarousel {...section.carouselProps} />
          </CourseSection>
        ))}
        {children}
      </CoursesAndChildren>
    </Root>
  );
};

export default CourseCatalog;
