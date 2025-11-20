export interface FacetConfig {
  [facetKey: string]: {
    label: string;
    type: 'checkbox' | 'dropdown';
    collapsedByDefault?: boolean;
  };
}

export const FACET_CONFIG: FacetConfig = {
  organization: {
    label: 'Created By',
    type: 'dropdown',
  },
  ages: {
    label: 'Age',
    type: 'checkbox',
  },
  topic: {
    label: 'Topic',
    type: 'checkbox',
  },
  activityType: {
    label: 'Activity Type',
    type: 'checkbox',
  },
  supportedLanguages: {
    label: 'Language',
    type: 'checkbox',
    collapsedByDefault: true,
  },
  length: {
    label: 'Length',
    type: 'checkbox',
  },
  accessibilitys: {
    label: 'Accessibility',
    type: 'checkbox',
  },
  technologyClassroom: {
    label: 'Classroom Technology',
    type: 'checkbox',
  },
  languageProgramming: {
    label: 'Programming Language',
    type: 'checkbox',
  },
};
