import type {ContentCardProps} from '@/components/contentful/contentCard';
import {resolveContentfulLink} from '@/contentful/resolveLink';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

// Bound entries are heterogeneous (curriculum, lab, resourcesAndTools,
// person, ...), so fields are read by author-configured field IDs rather
// than a fixed shape.
export type CardEntryFields = Record<string, unknown>;
export type CardEntry = Entry<CardEntryFields>;

/** Comma-separated field-ID fallback lists; the first non-empty field wins. */
export type FieldMapping = {
  titleFields: string;
  descriptionFields: string;
  imageFields: string;
  linkFields: string;
  badgeFields: string;
};

// The shared vocabulary across curriculum/lab/selfPacedPl/resourcesAndTools,
// with fallbacks covering the known outliers (person uses name/bio/
// personalLink). Also the definition's pre-populated defaults.
export const DEFAULT_FIELD_MAPPING: FieldMapping = {
  titleFields: 'title, name',
  descriptionFields: 'shortDescription, bio, description',
  imageFields: 'image',
  linkFields: 'primaryLinkRef, personalLink, secondaryLinkRef',
  badgeFields: 'actionBlockOverline',
};

export type MappedCard = {
  id: string;
  props: Pick<
    ContentCardProps,
    'title' | 'description' | 'image' | 'link' | 'badge'
  >;
};

const parseFieldList = (ids: string): string[] =>
  ids
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);

const pickField = (fields: CardEntryFields, ids: string): unknown => {
  for (const id of parseFieldList(ids)) {
    const value = fields[id];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
};

const asText = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

// Cuts overlong text at the last word boundary within the limit and appends
// an ellipsis; text within the limit passes through untouched.
const truncateAtWord = (
  text: string | undefined,
  maxLength: number | undefined,
): string | undefined => {
  if (!text || !maxLength || maxLength <= 0 || text.length <= maxLength) {
    return text;
  }
  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');
  const atWord = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${atWord.trimEnd()}…`;
};

// Array badge fields (e.g. topics) contribute their first item.
const asBadge = (value: unknown): string | undefined =>
  Array.isArray(value) ? asText(value[0]) : asText(value);

/**
 * Normalizes a bound entry of any content type into Content Card props via
 * the configured field mapping. Entries with no title in the mapped fields
 * return undefined and are skipped.
 *
 * resolveContentfulLink reads the Experiences in-memory entity store, so
 * this must only be called during render (the carousel invokes it inside
 * useMemo, matching UnitCarousel).
 */
export function mapEntryToCardProps(
  entry: CardEntry | undefined,
  mapping: FieldMapping,
  maxDescriptionLength?: number,
): MappedCard | undefined {
  const fields = entry?.fields;
  if (!entry || !fields) {
    return undefined;
  }

  const title = asText(pickField(fields, mapping.titleFields));
  if (!title) {
    return undefined;
  }

  // Image and link references arrive from the entity store as unresolved
  // {sys: {type: 'Link'}} stubs; a plain URL string is passed through
  // (ContentCard normalizes it via getAbsoluteImageUrl).
  const rawImage = pickField(fields, mapping.imageFields);
  const image =
    asText(rawImage) ??
    resolveContentfulLink<ExperienceAsset>(rawImage)?.fields?.file?.url;

  const resolvedLink = resolveContentfulLink<LinkEntry>(
    pickField(fields, mapping.linkFields),
  );
  const link = resolvedLink?.fields ? resolvedLink : undefined;

  return {
    id: entry.sys.id,
    props: {
      title,
      description: truncateAtWord(
        asText(pickField(fields, mapping.descriptionFields)),
        maxDescriptionLength,
      ),
      image,
      link,
      badge: asBadge(pickField(fields, mapping.badgeFields)),
    },
  };
}
