import {ContentfulClientApi, Entry, EntrySkeletonType} from 'contentful';

export async function getAllEntriesForContentType<
  EntrySkeleton extends EntrySkeletonType = EntrySkeletonType,
>(client: ContentfulClientApi<undefined>, contentType: string) {
  console.log(`Fetching all entries for content type: ${contentType}`);

  const allEntries: Entry<EntrySkeleton, undefined>[] = [];
  const pageSize = 100;
  let skip = 0;
  let total = 0;

  do {
    const response = await client.getEntries<EntrySkeleton>({
      content_type: contentType,
      skip,
      limit: pageSize,
    });

    allEntries.push(...response.items);
    total = response.total;
    skip += pageSize;
  } while (allEntries.length < total);

  console.log(
    `Fetched ${allEntries.length} entries for content type: ${contentType}`,
  );

  return allEntries;
}
