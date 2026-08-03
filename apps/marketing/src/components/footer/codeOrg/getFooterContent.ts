import {draftMode} from 'next/headers';

import {SiteChromeContentResult} from '@/components/common/siteChromeContent';
import {isExternalLink} from '@/components/common/utils';
import {Brand} from '@/config/brand';
import {getStage} from '@/config/stage';
import {getContentfulClient} from '@/contentful/client';
import {isUnknownContentTypeError} from '@/contentful/errors';
import logger from '@/logger/contentful';

import {DEFAULT_FOOTER_CONTENT} from './config';
import {
  FooterContent,
  FooterLink,
  FooterLinkColumn,
  SiteFooterEntry,
  SiteFooterFields,
  SiteFooterItemFields,
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

function mapFooterItem(item: unknown): FooterLink | null {
  if (!isResolvedEntry(item)) return null;
  const fields = item.fields as SiteFooterItemFields;
  if (!fields.title || !fields.primaryTarget) return null;
  return {
    label: fields.title,
    href: fields.primaryTarget,
    isExternal: isExternalLink(
      fields.primaryTarget,
      Brand.CODE_DOT_ORG,
      getStage(),
    ),
  };
}

// Columns with no valid items are dropped; a heading-less column's list joins
// the preceding heading's group as a continuation list.
function mapColumns(fields: SiteFooterFields): FooterLinkColumn[] {
  const rawColumns = [
    {heading: fields.column1Heading, list: fields.column1ItemList},
    {heading: fields.column2Heading, list: fields.column2ItemList},
    {heading: fields.column3Heading, list: fields.column3ItemList},
    {heading: fields.column4Heading, list: fields.column4ItemList},
    {heading: fields.column5Heading, list: fields.column5ItemList},
  ];
  const columns: FooterLinkColumn[] = [];
  for (const {heading, list} of rawColumns) {
    const links = (Array.isArray(list) ? list : [])
      .map(mapFooterItem)
      .filter((link): link is FooterLink => link !== null);
    if (!links.length) continue;
    const previous = columns[columns.length - 1];
    if (!heading && previous) {
      previous.lists.push(links);
    } else {
      columns.push({heading: heading || undefined, lists: [links]});
    }
  }
  return columns;
}

/**
 * Fetches the single `siteFooter` entry (tagline, mission, up to five link
 * columns of `siteFooterItem` entries). Returns 'unavailable' when Contentful
 * is unavailable so callers fall back to DEFAULT_FOOTER_CONTENT; the footer
 * must never throw from the layout. LEGACY-ENV-COMPAT: returns
 * 'legacy-environment' when the siteFooter content type doesn't exist (old
 * production environment) so callers render the legacy corporateSite footer.
 */
export async function getFooterContent(): Promise<
  SiteChromeContentResult<FooterContent>
> {
  try {
    const isDraftModeEnabled = (await draftMode()).isEnabled;
    const contentfulClient = getContentfulClient(isDraftModeEnabled);
    if (!contentfulClient) return {status: 'unavailable'};

    // include: 2 resolves siteFooter → siteFooterItem references in one call.
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
      return {status: 'unavailable'};
    }

    const linkColumns = mapColumns(fields);
    return {
      status: 'ok',
      content: {
        tagline: fields.tagline || DEFAULT_FOOTER_CONTENT.tagline,
        mission: fields.mission || DEFAULT_FOOTER_CONTENT.mission,
        copyright: fields.copyright || DEFAULT_FOOTER_CONTENT.copyright,
        linkColumns: linkColumns.length
          ? linkColumns
          : DEFAULT_FOOTER_CONTENT.linkColumns,
      },
    };
  } catch (error) {
    // LEGACY-ENV-COMPAT: a deterministic "content type doesn't exist" error
    // identifies the old environment; transient errors keep the new-design
    // defaults so a Contentful blip never resurrects the legacy footer.
    if (isUnknownContentTypeError(error)) {
      return {status: 'legacy-environment'};
    }
    logger.warn(`Failed to fetch siteFooter content: ${error}`);
    return {status: 'unavailable'};
  }
}
