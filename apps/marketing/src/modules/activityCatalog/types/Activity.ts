export type OramaEnum = (string | number)[];

export interface Activity {
  title: string;
  image: string;
  organization: OramaEnum;
  ages: OramaEnum;
  languageProgramming: OramaEnum;
  shortDescription: string;
  primaryLinkRef: string;
  secondaryLinkRef?: string;
  technologyClassroom: OramaEnum;
  topic: OramaEnum;
  activityType: OramaEnum;
  length: OramaEnum;
  accessibilitys: OramaEnum;
  languagesText: string;
  supportedLanguages: OramaEnum;
  tutorialID: string;
  featuredPosition: number;
}

export interface OramaActivity extends Activity {
  sortKey: string;
  /** The activity's catalogs, from its Contentful tags. */
  catalogs: OramaEnum;
}

export enum ActivityType {
  HOUR_OF_AI = 'hour-of-ai',
  HOUR_OF_CODE = 'hour-of-code',
}

export const ValidActivityTypes = new Set(Object.values(ActivityType));
