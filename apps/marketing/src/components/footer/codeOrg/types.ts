import {Entry} from '@/types/contentful/Entry';

export type FooterLink = {
  label: string;
  href: string;
  ariaLabel?: string;
  isExternal?: boolean;
};

// A heading with one or more link lists beneath it. The first list sits
// directly under the heading; additional lists come from heading-less
// Contentful columns and render as continuation columns beside it.
export type FooterLinkColumn = {
  heading?: string;
  lists: FooterLink[][];
};

export type FooterContent = {
  tagline: string;
  mission: string;
  copyright: string;
  linkColumns: FooterLinkColumn[];
};

// Contentful shapes below are verified against the published `siteFooter`
// entry (sandbox env, 2ADqyuOu87A6cc6TxCn6ok). Reference fields arrive as
// resolved entries or unresolved link stubs, hence `unknown[]` + the runtime
// guards in getFooterContent.
export type SiteFooterItemFields = {
  internalName?: string;
  title?: string;
  primaryTarget?: string;
};

export type SiteFooterFields = {
  internalTitle?: string;
  tagline?: string;
  mission?: string;
  copyright?: string;
  column1Heading?: string;
  column1ItemList?: unknown[];
  column2Heading?: string;
  column2ItemList?: unknown[];
  column3Heading?: string;
  column3ItemList?: unknown[];
  column4Heading?: string;
  column4ItemList?: unknown[];
  column5Heading?: string;
  column5ItemList?: unknown[];
};

export type SiteFooterEntry = Entry<SiteFooterFields>;
