import {BaseEntry} from 'contentful';

export type LinkEntry = BaseEntry & {
  fields: {
    ariaLabel?: string;
    isThisAnExternalLink: boolean;
    label: string;
    primaryTarget: string;
  };
};
