import {draftMode} from 'next/headers';
import {cache} from 'react';

import {toAbsoluteFileUrl} from '@/components/contentful/autoDownload/startFileDownload';
import {getContentfulClient} from '@/contentful/client';
import logger from '@/logger/contentful';

import {NATIONAL_SUMMARY_ENTRY_ID} from './constants';

interface FileDownloadFields {
  fileAsset?: {fields?: {file?: {url?: string}}};
  externalFileUrl?: string;
}

/**
 * The national summary PDF's URL, or null until a file or URL is attached to
 * its File Download entry. Throws when the fetch fails, so ISR keeps serving
 * the last good page.
 */
export const getNationalSummaryUrl = cache(
  async (options?: {isDraft?: boolean}): Promise<string | null> => {
    const isDraft = options?.isDraft ?? (await draftMode()).isEnabled;
    const client = getContentfulClient(isDraft);
    if (!client) {
      return null;
    }

    let fields: FileDownloadFields | undefined;
    try {
      // sys.id[in], as in getReport: it tags the fetch for the publish webhook.
      const response = await client.getEntries({
        'sys.id[in]': [NATIONAL_SUMMARY_ENTRY_ID],
        limit: 1,
      });
      fields = response.items[0]?.fields as FileDownloadFields | undefined;
    } catch (error) {
      logger.error(
        {entryId: NATIONAL_SUMMARY_ENTRY_ID, error},
        'national summary fetch failed',
      );
      throw error;
    }

    const external = fields?.externalFileUrl?.trim();
    return (
      toAbsoluteFileUrl(fields?.fileAsset?.fields?.file?.url) ??
      // The field allows site paths such as /files/report.pdf.
      (external?.startsWith('/') ? external : toAbsoluteFileUrl(external)) ??
      null
    );
  },
);
