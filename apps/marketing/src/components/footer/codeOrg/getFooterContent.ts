import {draftMode} from 'next/headers';

import {getContentfulClient} from '@/contentful/client';
import logger from '@/logger/contentful';
import {Link} from '@/types/contentful/entries/Link';

import {DEFAULT_FOOTER_CONTENT} from './config';
import {
  FooterContent,
  FooterLink,
  FooterLinkColumn,
  ListFields,
  SiteFooterEntry,
} from './types';

const SITE_FOOTER_CONTENT_TYPE = 'siteFooter';

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

function mapLink(item: unknown): FooterLink | null {
  if (!isResolvedEntry(item)) return null;
  const fields = item.fields as Partial<Link>;
  if (!fields.label || !fields.primaryTarget) return null;
  return {
    label: fields.label,
    href: fields.primaryTarget,
    ariaLabel: fields.ariaLabel,
    isExternal: fields.isThisAnExternalLink,
  };
}

function mapColumns(linkColumns: unknown[] | undefined): FooterLinkColumn[] {
  if (!Array.isArray(linkColumns)) return [];
  const columns: FooterLinkColumn[] = [];
  for (const column of linkColumns) {
    if (!isResolvedEntry(column)) continue;
    const fields = column.fields as ListFields;
    if (!fields.listHeading) continue;
    const links = (fields.itemsInThisList ?? [])
      .map(mapLink)
      .filter((link): link is FooterLink => link !== null);
    if (!links.length) continue;
    columns.push({heading: fields.listHeading, links});
  }
  return columns;
}

/**
 * Fetches the single `siteFooter` entry (tagline, mission, link columns built
 * from `list` entries of `link` entries). Returns null when Contentful is
 * unavailable so callers fall back to DEFAULT_FOOTER_CONTENT; the footer must
 * never throw from the layout.
 */
export async function getFooterContent(): Promise<FooterContent | null> {
  try {
    const isDraftModeEnabled = (await draftMode()).isEnabled;
    const contentfulClient = getContentfulClient(isDraftModeEnabled);
    if (!contentfulClient) return null;

    // include: 2 resolves siteFooter → list → link references in one call.
    // Content is authored in en-US only; translations come from LocalizeJS.
    const response = await contentfulClient.getEntries<SiteFooterEntry>({
      content_type: SITE_FOOTER_CONTENT_TYPE,
      limit: 1,
      include: 2,
      locale: 'en-US',
    });

    const fields = response.items[0]?.fields;
    if (!fields) {
      logger.warn('No published siteFooter entry found; using footer defaults');
      return null;
    }

    const linkColumns = mapColumns(fields.linkColumns);
    return {
      tagline: fields.tagline || DEFAULT_FOOTER_CONTENT.tagline,
      mission: fields.mission || DEFAULT_FOOTER_CONTENT.mission,
      copyright: fields.copyright || DEFAULT_FOOTER_CONTENT.copyright,
      linkColumns: linkColumns.length
        ? linkColumns
        : DEFAULT_FOOTER_CONTENT.linkColumns,
    };
  } catch (error) {
    logger.warn(`Failed to fetch siteFooter content: ${error}`);
    return null;
  }
}
