import {draftMode} from 'next/headers';

import {getContentfulClient} from '@/contentful/client';
import logger from '@/logger/contentful';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {DEFAULT_HEADER_CONTENT, PROMO_BACKGROUNDS} from './config';
import {
  HeaderContent,
  HeaderMenuItem,
  HeaderSubmenu,
  HeaderSubmenuColumn,
  HeaderSubmenuItem,
  PromoBackground,
  SiteHeaderEntry,
  SiteHeaderItemFields,
  SiteHeaderSubmenuItemFields,
  SubmenuColumnType,
} from './types';

const SITE_HEADER_CONTENT_TYPE = 'siteHeader';

const COLUMN_TYPES: SubmenuColumnType[] = [
  'Text List',
  'Icon List',
  'Image List Vertical',
  'Image List Horizontal',
];
const DEFAULT_COLUMN_TYPE: SubmenuColumnType = 'Text List';
const DEFAULT_PROMO_BACKGROUND: PromoBackground = 'lightBlue';

// Resolved references arrive with `fields`; unpublished ones remain link
// stubs on the delivery client and must be skipped.
function isResolvedEntry(
  value: unknown,
): value is {fields: Record<string, unknown>} {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as {fields?: unknown}).fields === 'object' &&
    (value as {fields?: unknown}).fields !== null
  );
}

function mapSubmenuItem(item: unknown): HeaderSubmenuItem | null {
  if (!isResolvedEntry(item)) return null;
  const fields = item.fields as SiteHeaderSubmenuItemFields;
  if (!fields.title || !fields.primaryTarget) return null;
  return {
    title: fields.title,
    href: fields.primaryTarget,
    subtitle: fields.subtitle || undefined,
    iconName: fields.iconName || undefined,
    imageUrl: getAbsoluteImageUrl(fields.image as ExperienceAsset | undefined),
  };
}

function mapColumnType(type: string | undefined): SubmenuColumnType {
  return COLUMN_TYPES.includes(type as SubmenuColumnType)
    ? (type as SubmenuColumnType)
    : DEFAULT_COLUMN_TYPE;
}

function mapColumns(fields: SiteHeaderItemFields): HeaderSubmenuColumn[] {
  const rawColumns = [
    {
      heading: fields.column1Heading,
      type: fields.column1Type,
      list: fields.column1ItemList,
    },
    {
      heading: fields.column2Heading,
      type: fields.column2Type,
      list: fields.column2ItemList,
    },
    {
      heading: fields.column3Heading,
      type: fields.column3Type,
      list: fields.column3ItemList,
    },
  ];
  const columns: HeaderSubmenuColumn[] = [];
  for (const {heading, type, list} of rawColumns) {
    const items = (Array.isArray(list) ? list : [])
      .map(mapSubmenuItem)
      .filter((item): item is HeaderSubmenuItem => item !== null);
    if (!items.length) continue;
    columns.push({
      heading: heading || undefined,
      type: mapColumnType(type),
      items,
    });
  }
  return columns;
}

function mapSubmenu(fields: SiteHeaderItemFields): HeaderSubmenu | undefined {
  if (!fields.submenuDropdown) return undefined;
  const columns = mapColumns(fields);
  if (!columns.length) return undefined;

  const promoContent = fields.promoBanner
    ? mapSubmenuItem(fields.promoBannerContent)
    : null;
  const background =
    fields.promoBannerBackground &&
    fields.promoBannerBackground in PROMO_BACKGROUNDS
      ? (fields.promoBannerBackground as PromoBackground)
      : DEFAULT_PROMO_BACKGROUND;

  return {
    subtitle: fields.menuSubtitle || undefined,
    columns,
    promo: promoContent ? {background, content: promoContent} : undefined,
  };
}

function mapMenuItem(item: unknown): HeaderMenuItem | null {
  if (!isResolvedEntry(item)) return null;
  const fields = item.fields as SiteHeaderItemFields;
  if (!fields.headerItemName || !fields.primaryTarget) return null;
  return {
    label: fields.headerItemName,
    mobileLabel: fields.mobileMenuPrimaryLinkLabel || undefined,
    href: fields.primaryTarget,
    submenu: mapSubmenu(fields),
  };
}

function mapMenuItems(list: unknown[] | undefined): HeaderMenuItem[] {
  if (!Array.isArray(list)) return [];
  return list
    .map(mapMenuItem)
    .filter((item): item is HeaderMenuItem => item !== null);
}

/**
 * Fetches the single `siteHeader` entry (main and secondary menus built from
 * `siteHeaderItem` entries with up to three `siteHeaderSubmenuItem` columns
 * plus an optional promo banner). Returns null when Contentful is unavailable
 * so callers fall back to DEFAULT_HEADER_CONTENT; the header must never throw
 * from the layout.
 */
export async function getHeaderContent(): Promise<HeaderContent | null> {
  try {
    const isDraftModeEnabled = (await draftMode()).isEnabled;
    const contentfulClient = getContentfulClient(isDraftModeEnabled);
    if (!contentfulClient) return null;

    // include: 3 resolves siteHeader → item → submenu item → image asset.
    // Content is authored in en-US only; translations come from LocalizeJS.
    const response = await contentfulClient.getEntries<SiteHeaderEntry>({
      content_type: SITE_HEADER_CONTENT_TYPE,
      limit: 1,
      include: 3,
      locale: 'en-US',
    });

    const fields = response.items[0]?.fields;
    if (!fields) {
      logger.warn('No published siteHeader entry found; using header defaults');
      return null;
    }

    const mainMenu = mapMenuItems(fields.mainMenuList);
    return {
      // An empty secondary menu is a valid authoring choice; an empty main
      // menu means the entry is unusable, so fall back.
      mainMenu: mainMenu.length ? mainMenu : DEFAULT_HEADER_CONTENT.mainMenu,
      secondaryMenu: mapMenuItems(fields.secondaryMenuList),
    };
  } catch (error) {
    logger.warn(`Failed to fetch siteHeader content: ${error}`);
    return null;
  }
}
