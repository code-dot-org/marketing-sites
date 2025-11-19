export type OramaEnum = (string | number)[];

export interface Activity {
  title: string;
  image: string;
  organization: OramaEnum;
  ages: OramaEnum;
  languageProgramming: OramaEnum;
  shortDescription: string;
  longDescription: string;
  primaryLinkRef: string;
  secondaryLinkRef?: string;
  technologyClassroom: OramaEnum;
  topic: OramaEnum;
  activityType: OramaEnum;
  length: OramaEnum;
  accessibilitys: OramaEnum;
  languagesText: string;
  supportedLanguages: OramaEnum;
  standards: string;
  tutorialID: string;
  featuredPosition: number;
}

export interface OramaActivity extends Activity {
  sortKey: string;
}

export enum ActivityType {
  HOUR_OF_AI = 'hour-of-ai',
  HOUR_OF_CODE = 'hour-of-code',
}

export const ValidActivityTypes = new Set(Object.values(ActivityType));
