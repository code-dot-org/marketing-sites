// LEGACY-ENV-COMPAT: the old production environment attaches SEO metadata to
// experiences via a linked `seoMetadata` entry. Remove when the production
// Contentful environment serves the new content model (flat SEO fields).
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

// All fields optional: the CDA omits empty fields from responses.
export type SeoMetadata = {
  seoTitle?: string;
  seoDescription?: string;
  hidePageFromSearchEnginesNoindex?: boolean;
  hideLinksFromSearchEnginesNofollow?: boolean;
  keywords?: string[];
  canonicalUrl?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: ExperienceAsset;
};

export type SeoMetadataEntry = Entry<SeoMetadata>;
