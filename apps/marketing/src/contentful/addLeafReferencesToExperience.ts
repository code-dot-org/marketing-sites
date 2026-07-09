import {
  extractLeafLinksReferencedFromExperience,
  fetchBySlug,
} from '@contentful/experiences-sdk-react';
import {ContentfulClientApi} from 'contentful';

type FetchedExperience = NonNullable<Awaited<ReturnType<typeof fetchBySlug>>>;

const BATCH_SIZE = 100;

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    chunks.push(items.slice(i, i + size));
  return chunks;
};

/**
 * The Experiences SDK fetches bound entities only two reference levels deep,
 * so entities reached through longer chains (e.g. Course Catalog → course →
 * unit → unit link/image) are missing from the delivery entity store and
 * components can't resolve them. This fetches those leaf references and adds
 * them to the store before the experience is serialized for the client.
 */
export async function addLeafReferencesToExperience(
  experience: FetchedExperience,
  client: ContentfulClientApi<undefined>,
  locale: string,
): Promise<void> {
  if (!experience.entityStore) return;

  const {entryIds, assetIds} =
    extractLeafLinksReferencedFromExperience(experience);
  if (!entryIds.length && !assetIds.length) return;

  const [entryResponses, assetResponses] = await Promise.all([
    Promise.all(
      chunk(entryIds, BATCH_SIZE).map(ids =>
        client.withoutLinkResolution.getEntries({
          'sys.id[in]': ids,
          locale,
          // One extra hop of includes covers chains one level deeper still.
          include: 2,
          limit: BATCH_SIZE,
        }),
      ),
    ),
    Promise.all(
      chunk(assetIds, BATCH_SIZE).map(ids =>
        client.getAssets({'sys.id[in]': ids, locale, limit: BATCH_SIZE}),
      ),
    ),
  ]);

  for (const response of entryResponses) {
    for (const entity of [
      ...response.items,
      ...(response.includes?.Entry ?? []),
      ...(response.includes?.Asset ?? []),
    ]) {
      experience.entityStore.updateEntity(entity);
    }
  }
  for (const response of assetResponses) {
    for (const asset of response.items) {
      experience.entityStore.updateEntity(asset);
    }
  }
}
