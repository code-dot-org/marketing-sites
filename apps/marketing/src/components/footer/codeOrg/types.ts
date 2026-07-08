import {Link} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';

export type FooterLink = {
  label: string;
  href: string;
  ariaLabel?: string;
  isExternal?: boolean;
};

export type FooterLinkColumn = {
  heading: string;
  links: FooterLink[];
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
export type ListFields = {
  listName?: string;
  listHeading?: string;
  itemsInThisList?: unknown[];
};

export type SiteFooterFields = {
  internalTitle?: string;
  tagline?: string;
  mission?: string;
  copyright?: string;
  linkColumns?: unknown[];
};

export type ListEntry = Entry<ListFields>;
export type SiteFooterEntry = Entry<SiteFooterFields>;
export type FooterLinkEntry = Entry<Link>;
