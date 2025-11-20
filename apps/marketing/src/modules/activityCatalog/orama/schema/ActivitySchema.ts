/**
 * Schema for an activity in the activity catalog. This is directly sourced from the Tutorial content type on Contentful.
 */
export const ActivitySchema = {
  title: 'string',
  image: 'string',
  organization: 'enum[]',
  ages: 'enum[]',
  languageProgramming: 'enum[]',
  shortDescription: 'string',
  longDescription: 'string',
  primaryLinkRef: 'string',
  secondaryLinkRef: 'string',
  technologyClassroom: 'enum[]',
  topic: 'enum[]',
  activityType: 'enum[]',
  length: 'enum[]',
  accessibilitys: 'enum[]',
  languagesText: 'string',
  supportedLanguages: 'enum[]',
  standards: 'string',
  tutorialID: 'string',
  primaryButton: 'string',
  featuredPosition: 'number',
  sortKey: 'string',
} as const;
