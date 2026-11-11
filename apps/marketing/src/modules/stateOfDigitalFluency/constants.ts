import type {BrandColor} from '@/components/common/colors';
import type {BadgeColor} from '@/components/contentful/badge/Badge';
import {
  CODEAI,
  type CodeaiColor,
  codeaiVar,
} from '@/components/dataDisplay/codeaiColors';

import type {Band, PolicyKey, Tier, TierLabel} from './types';

/** The single `reportData` entry this report reads. */
export const REPORT_ENTRY_ID = 'state-of-digital-fluency';

export const REPORT_TITLE = 'The State of Digital Fluency';

/** The heroes' description of the report. Draft copy for review; the Policy team may replace it. */
export const OVERVIEW_INTRO =
  "The State of Digital Fluency measures how well each state prepares students for a world shaped by computing and AI. Every state's Digital Fluency Index Score combines its Digital Sciences policies with high school access, participation, momentum and leadership.";

export const NOT_REPORTED = 'Not reported';

export const POLICY_KEYS: PolicyKey[] = [
  'plan_guidance',
  'standards',
  'sea_position',
  'data_reporting',
  'diploma_req',
  'counts_grad',
  'require_offer',
  'pd_funding',
  'credentialing',
  'preservice',
];

export const POLICY_GROUPS: {label: string; keys: PolicyKey[]}[] = [
  {
    label: 'System Levers',
    keys: ['plan_guidance', 'standards', 'sea_position', 'data_reporting'],
  },
  {
    label: 'Student Experiences',
    keys: ['diploma_req', 'counts_grad', 'require_offer'],
  },
  {
    label: 'Teacher Supports',
    keys: ['pd_funding', 'credentialing', 'preservice'],
  },
];

export const POLICY_LABELS: Record<PolicyKey, string> = {
  plan_guidance: 'Statewide Plan & School Guidance',
  standards: 'K-12 Digital Science Standards',
  sea_position: 'Dedicated Digital Science SEA Position',
  data_reporting: 'Data, Reporting & Accountability',
  diploma_req: 'Digital Science Diploma Requirement',
  counts_grad: 'Digital Sciences Count Toward Grad Req',
  require_offer: 'Require HS to Offer Digital Sciences',
  pd_funding: 'Teacher Professional Learning Funding',
  credentialing: 'Credentialing & Recognition for Educators',
  preservice: 'Preservice Teacher Programs',
};

export const TIER_LABELS: Record<Tier, string> = {
  no: 'No Policy',
  in_progress: 'In Progress',
  historic: 'Historic',
  emerging: 'Emerging',
  developing: 'Developing',
  transformative: 'Transformative',
};

/** Each score tier's CodeAI color family. */
export const TIER_FAMILIES: Record<TierLabel, 'purple' | 'blue' | 'orange'> = {
  Transformative: 'purple',
  Developing: 'blue',
  Emerging: 'orange',
};

/** Bars, map fills and other graphics per tier (3:1 on white). */
export const TIER_COLORS: Record<TierLabel, string> = {
  Transformative: CODEAI.purplePrimary,
  Developing: CODEAI.bluePrimary,
  Emerging: CODEAI.orangePrimary,
};

/** The score band behind a state's score: the tier's Dark shade (white text meets AA). */
export const TIER_SECTION_BACKGROUNDS: Record<
  TierLabel,
  BrandColor & CodeaiColor
> = {
  Transformative: 'purpleDark',
  Developing: 'blueDark',
  Emerging: 'orangeDark',
};

export const UNSCORED_SECTION_BACKGROUND: BrandColor & CodeaiColor = 'gray8';

/** Graphics for states with no value. */
export const NOT_SCORED_COLOR = CODEAI.gray3;

/** The national-average reference line on charts. */
export const NATIONAL_MARKER_COLOR = CODEAI.gray8;

export const BANDS: {band: Band; label: string; fill: string}[] = [
  {band: '81-100', label: '81 – 100', fill: CODEAI.purplePrimary},
  {band: '51-80', label: '51 – 80', fill: CODEAI.purpleMid},
  {band: '0-50', label: '0 – 50', fill: CODEAI.purpleLight},
];

export const BAND_FILLS: Record<Band, string> = Object.fromEntries(
  BANDS.map(b => [b.band, b.fill]),
) as Record<Band, string>;

/** The Badge color per policy tier (light appearance: dark text on a light fill). */
export const TIER_BADGES: Record<Tier, BadgeColor> = {
  no: 'black',
  in_progress: 'pink',
  historic: 'black',
  emerging: 'orange',
  developing: 'blue',
  transformative: 'purple',
};

/** How many of the five bar segments each tier fills, and with which colour. */
export const TIER_SEGMENTS: Record<Tier, (string | null)[]> = {
  no: [null, null, null, null, null],
  in_progress: [
    `repeating-linear-gradient(45deg, ${codeaiVar('orangePrimary')} 0, ${codeaiVar('orangePrimary')} 3px, ${codeaiVar('orangeLight')} 3px, ${codeaiVar('orangeLight')} 6px)`,
    null,
    null,
    null,
    null,
  ],
  historic: [codeaiVar('purpleMid'), null, null, null, null],
  emerging: [
    codeaiVar('purpleMid'),
    codeaiVar('orangePrimary'),
    null,
    null,
    null,
  ],
  developing: [
    codeaiVar('purpleMid'),
    codeaiVar('orangePrimary'),
    codeaiVar('bluePrimary'),
    null,
    null,
  ],
  transformative: [
    codeaiVar('purpleMid'),
    codeaiVar('orangePrimary'),
    codeaiVar('bluePrimary'),
    codeaiVar('purplePrimary'),
    codeaiVar('purplePrimary'),
  ],
};

/** Gender colours: women purple, men orange, other blue. */
export const GENDER_COLORS = {
  female: CODEAI.purplePrimary,
  male: CODEAI.orangePrimary,
  other: CODEAI.bluePrimary,
} as const;

export interface Jurisdiction {
  postal: string;
  name: string;
  slug: string;
}

const JURISDICTION_NAMES: [string, string][] = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
];

/** The 50 states and DC. The URL slug is the lowercase postal code. */
export const JURISDICTIONS: Jurisdiction[] = JURISDICTION_NAMES.map(
  ([postal, name]) => ({postal, name, slug: postal.toLowerCase()}),
);

export const JURISDICTION_BY_SLUG = new Map(
  JURISDICTIONS.map(j => [j.slug, j]),
);

/**
 * The prototype's static highlight cards (report.html page 7 and
 * national.html), unchanged. Not in the sheet; see the plan's Policy team
 * checklist.
 */
export const HIGHLIGHTS = [
  {
    state: 'Louisiana',
    tag: 'AI Guidance',
    headline: 'Board Resolution Paves the Way',
    body: 'After launching AI guidance in 2024, the state is responding to national and state AI executive orders. A board resolution on AI has paved the way for strategic planning and statewide coordination.',
  },
  {
    state: 'North Carolina',
    tag: 'Professional Learning',
    headline: 'Teacher Leaders Drive Implementation',
    body: 'State guidance emphasizes the technical aspects of AI literacy, including designing AI solutions. The state trained 63 educators from 35 districts to lead schoolwide AI initiatives.',
  },
  {
    state: 'West Virginia',
    tag: 'Graduation Requirement',
    headline: 'First State to Name AI in Grad Rule',
    body: 'The only state to adopt a CS graduation requirement in 2025, WV will also allow at least one foundational AI course to count. Its Department of Education is also among the few with a dedicated Digital Sciences coordinator.',
  },
  {
    state: 'Tennessee',
    tag: 'Equity',
    headline: 'Women Now 42% of CS Enrollment',
    body: 'In its third year of implementing a CS graduation requirement, CS access and participation have grown rapidly, with young women now comprising 42% of CS course enrollment.',
  },
];
