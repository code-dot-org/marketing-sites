export interface FacetConfig {
  [facetKey: string]: {
    label: string;
    collapsedByDefault?: boolean;
  };
}

export const FACET_CONFIG: FacetConfig = {
  ages: {
    label: 'Age',
  },
  topic: {
    label: 'Topic',
  },
  activityType: {
    label: 'Activity Type',
  },
  supportedLanguages: {
    label: 'Language',
    collapsedByDefault: true,
  },
  length: {
    label: 'Length',
  },
  accessibilitys: {
    label: 'Accessibility',
  },
  technologyClassroom: {
    label: 'Classroom Technology',
  },
  languageProgramming: {
    label: 'Programming Language',
  },
};
