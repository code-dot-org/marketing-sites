import {BaseEntry} from 'contentful';

export type ImageAssetEntry = BaseEntry & {
  fields: {
    description?: string;
    title?: string;
    file: {
      url: string;
      contentType?: string;
      details: {
        image: {
          width?: number;
          height?: number;
        };
        size?: number;
      };
    };
  };
};
