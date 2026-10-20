import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export type FileDownload = {
  /** Internal entry name */
  title: string;
  /** Visitor-facing label */
  fileTitle: string;
  // Arrives from the Experiences entity store as an unresolved
  // {sys: {type: 'Link'}} stub when nested in a bound list.
  fileAsset?: ExperienceAsset;
  externalFileUrl?: string;
};

export type FileDownloadEntry = Entry<FileDownload>;
