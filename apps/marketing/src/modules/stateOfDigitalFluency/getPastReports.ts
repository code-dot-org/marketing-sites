import {draftMode} from 'next/headers';
import {cache} from 'react';

import {toAbsoluteFileUrl} from '@/components/contentful/autoDownload/startFileDownload';
import {getContentfulClient} from '@/contentful/client';
import logger from '@/logger/contentful';
import type {FileDownloadEntry} from '@/types/contentful/entries/FileDownload';

import {PAST_REPORTS_LIST_ENTRY_ID} from './constants';

interface ListItem {
  sys?: {id?: string; contentType?: {sys?: {id?: string}}};
  fields?: {
    title?: string;
    fileTitle?: string;
    fileAsset?: {fields?: {file?: {url?: string}}};
    externalFileUrl?: string;
  };
}

/**
 * The past reports list's File Download entries, in list order, trimmed to
 * what the File Downloader reads. Empty until the list is published. Throws
 * when the fetch fails, so ISR keeps serving the last good page.
 */
export const getPastReports = cache(
  async (options?: {isDraft?: boolean}): Promise<FileDownloadEntry[]> => {
    const isDraft = options?.isDraft ?? (await draftMode()).isEnabled;
    const client = getContentfulClient(isDraft);
    if (!client) {
      return [];
    }

    let items: ListItem[];
    try {
      // sys.id[in], as in getReport: it tags the fetch for the publish webhook.
      const response = await client.getEntries({
        'sys.id[in]': [PAST_REPORTS_LIST_ENTRY_ID],
        include: 2,
        limit: 1,
      });
      const list = response.items[0]?.fields as
        | {itemsInThisList?: ListItem[]}
        | undefined;
      items = list?.itemsInThisList ?? [];
    } catch (error) {
      logger.error(
        {entryId: PAST_REPORTS_LIST_ENTRY_ID, error},
        'past reports fetch failed',
      );
      throw error;
    }

    // Plain objects, so the client component gets a small serialisable prop.
    return items.flatMap(item => {
      const id = item.sys?.id;
      const contentType = item.sys?.contentType?.sys?.id;
      const label = item.fields?.fileTitle || item.fields?.title;
      if (!id || contentType !== 'fileDownload' || !label) {
        return [];
      }
      const url = toAbsoluteFileUrl(item.fields?.fileAsset?.fields?.file?.url);
      const externalFileUrl = item.fields?.externalFileUrl;
      if (!url && !externalFileUrl) {
        return [];
      }
      return [
        {
          sys: {id, contentType: {sys: {id: contentType}}},
          fields: {
            title: label,
            fileTitle: label,
            ...(url && {fileAsset: {fields: {file: {url}}}}),
            ...(externalFileUrl && {externalFileUrl}),
          },
        } as unknown as FileDownloadEntry,
      ];
    });
  },
);
