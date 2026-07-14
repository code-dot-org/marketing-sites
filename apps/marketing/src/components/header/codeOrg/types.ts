import {Entry} from '@/types/contentful/Entry';

export type SubmenuColumnType =
  | 'Text List'
  | 'Icon List'
  | 'Image List Vertical'
  | 'Image List Horizontal';

export type PromoBackground =
  | 'lightPurple'
  | 'lightBlue'
  | 'lightGreen'
  | 'lightOrange'
  | 'lightPink';

export type HeaderSubmenuItem = {
  title: string;
  href: string;
  subtitle?: string;
  /** FontAwesome icon name without the `fa-` prefix; used by Icon List columns. */
  iconName?: string;
  /** Absolute Contentful asset URL; used by Image List columns. */
  imageUrl?: string;
};

export type HeaderSubmenuColumn = {
  heading?: string;
  type: SubmenuColumnType;
  items: HeaderSubmenuItem[];
};

export type HeaderPromo = {
  background: PromoBackground;
  content: HeaderSubmenuItem;
};

export type HeaderSubmenu = {
  subtitle?: string;
  columns: HeaderSubmenuColumn[];
  promo?: HeaderPromo;
};

export type HeaderMenuItem = {
  label: string;
  /** Overrides `label` for the mobile menu's primary link, when authored. */
  mobileLabel?: string;
  href: string;
  submenu?: HeaderSubmenu;
};

export type HeaderContent = {
  mainMenu: HeaderMenuItem[];
  secondaryMenu: HeaderMenuItem[];
};

// Contentful shapes below are verified against the sandbox content model and
// the published "Site Header (DO NOT EDIT)" entry. Reference fields arrive as
// resolved entries or unresolved link stubs, hence `unknown` + the runtime
// guards in getHeaderContent.
export type SiteHeaderFields = {
  internalName?: string;
  mainMenuList?: unknown[];
  secondaryMenuList?: unknown[];
};

export type SiteHeaderItemFields = {
  internalName?: string;
  headerItemName?: string;
  mobileMenuPrimaryLinkLabel?: string;
  primaryTarget?: string;
  submenuDropdown?: boolean;
  menuSubtitle?: string;
  column1Heading?: string;
  column1Type?: string;
  column1ItemList?: unknown[];
  column2Heading?: string;
  column2Type?: string;
  column2ItemList?: unknown[];
  column3Heading?: string;
  column3Type?: string;
  column3ItemList?: unknown[];
  promoBanner?: boolean;
  promoBannerBackground?: string;
  promoBannerContent?: unknown;
};

export type SiteHeaderSubmenuItemFields = {
  internalName?: string;
  title?: string;
  primaryTarget?: string;
  subtitle?: string;
  iconName?: string;
  image?: unknown;
};

export type SiteHeaderEntry = Entry<SiteHeaderFields>;
