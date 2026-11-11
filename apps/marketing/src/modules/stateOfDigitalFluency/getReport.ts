import {draftMode} from 'next/headers';
import {cache} from 'react';

import {getContentfulClient} from '@/contentful/client';
import logger from '@/logger/contentful';

import {REPORT_ENTRY_ID} from './constants';
import {checkReportShape} from './reportShape';
import type {Report, ReportWarning} from './types';

interface ReportEntryFields {
  dataAsOf?: string;
  data?: unknown;
  warnings?: {items?: ReportWarning[]} | null;
}

/** Thrown when the entry exists but its data doesn't have the report's shape. */
export class ReportShapeError extends Error {
  constructor(
    readonly paths: string[],
    readonly version: number | undefined,
  ) {
    super(`reportData ${REPORT_ENTRY_ID} has an invalid shape`);
    this.name = 'ReportShapeError';
  }
}

function toReport(fields: ReportEntryFields, version?: number): Report {
  const shape = checkReportShape(fields.data);

  if (!shape.success) {
    logger.error(
      {entryId: REPORT_ENTRY_ID, version, paths: shape.paths},
      'reportData failed the shape check',
    );
    throw new ReportShapeError(shape.paths, version);
  }

  return {
    data: shape.data,
    dataAsOf: fields.dataAsOf ?? null,
    warnings: Array.isArray(fields.warnings?.items)
      ? fields.warnings.items
      : [],
  };
}

async function fetchReport(isDraft: boolean): Promise<Report | null> {
  const client = getContentfulClient(isDraft);
  if (!client) {
    return null;
  }

  let entry;
  try {
    // getEntries with sys.id[in], not getEntry: the client adapter tags the
    // fetch by entry ID only for sys.id[in], and the publish webhook
    // revalidates by that tag.
    const response = await client.getEntries({
      'sys.id[in]': [REPORT_ENTRY_ID],
      limit: 1,
    });
    entry = response.items[0];
  } catch (error) {
    // Rethrow rather than return null: a 404 here would replace the cached
    // page during a Contentful outage, while an error keeps the stale one.
    logger.error({entryId: REPORT_ENTRY_ID, error}, 'reportData fetch failed');
    throw error;
  }

  if (!entry) {
    return null;
  }

  return toReport(entry.fields as ReportEntryFields, entry.sys.revision);
}

/**
 * The State of Digital Fluency report, or null when there is no entry: on the
 * public host that means it has never been published (the launch gate).
 * Throws when the fetch fails or the data fails the shape check, so ISR keeps
 * serving the last good page.
 */
export const getReport = cache(
  async (options?: {isDraft?: boolean}): Promise<Report | null> => {
    const isDraft = options?.isDraft ?? (await draftMode()).isEnabled;
    return fetchReport(isDraft);
  },
);
