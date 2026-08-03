/* eslint-disable @typescript-eslint/no-explicit-any */
import {addLeafReferencesToExperience} from '@/contentful/addLeafReferencesToExperience';

const makeEntry = (id: string, fields: Record<string, unknown> = {}) => ({
  sys: {
    id,
    type: 'Entry',
    contentType: {sys: {type: 'Link', linkType: 'ContentType', id: 'course'}},
  },
  fields,
});

const makeAsset = (id: string) => ({
  sys: {id, type: 'Asset'},
  fields: {file: {url: `//images/${id}.png`}},
});

const entryLink = (id: string) => ({
  sys: {type: 'Link', linkType: 'Entry', id},
});
const assetLink = (id: string) => ({
  sys: {type: 'Link', linkType: 'Asset', id},
});

// Minimal stand-in for the SDK EntityStore surface the helper (and the SDK's
// extractLeafLinksReferencedFromExperience) relies on.
class FakeEntityStore {
  private byId: Map<string, any>;

  constructor(entities: any[]) {
    this.byId = new Map(entities.map(entity => [entity.sys.id, entity]));
  }

  get entities() {
    return [...this.byId.values()];
  }

  getEntityFromLink(link: any) {
    return this.byId.get(link.sys.id);
  }

  updateEntity(entity: any) {
    this.byId.set(entity.sys.id, entity);
  }
}

const makeClient = ({
  entries = [] as any[],
  includes = {} as any,
  assets = [] as any[],
} = {}) => {
  const getEntries = jest.fn().mockResolvedValue({items: entries, includes});
  const getAssets = jest.fn().mockResolvedValue({items: assets});
  return {
    getEntries: jest.fn(),
    getAssets,
    withoutLinkResolution: {getEntries},
  } as any;
};

describe('addLeafReferencesToExperience', () => {
  it('fetches unresolved entry and asset references and adds them to the store', async () => {
    // A unit in the store references a link entry and an image asset that
    // are NOT in the store (three levels from the bound head entity).
    const store = new FakeEntityStore([
      makeEntry('unit-1', {
        primaryLinkRef: entryLink('leaf-link-1'),
        image: assetLink('leaf-asset-1'),
      }),
    ]);
    const client = makeClient({
      entries: [makeEntry('leaf-link-1', {label: 'Explore'})],
      assets: [makeAsset('leaf-asset-1')],
    });

    await addLeafReferencesToExperience(
      {entityStore: store} as any,
      client,
      'en-US',
    );

    expect(client.withoutLinkResolution.getEntries).toHaveBeenCalledWith(
      expect.objectContaining({
        'sys.id[in]': ['leaf-link-1'],
        locale: 'en-US',
      }),
    );
    expect(client.getAssets).toHaveBeenCalledWith(
      expect.objectContaining({'sys.id[in]': ['leaf-asset-1']}),
    );
    expect(store.getEntityFromLink(entryLink('leaf-link-1'))).toBeDefined();
    expect(store.getEntityFromLink(assetLink('leaf-asset-1'))).toBeDefined();
  });

  it('adds entities from the entries response includes', async () => {
    const store = new FakeEntityStore([
      makeEntry('unit-1', {primaryLinkRef: entryLink('leaf-link-1')}),
    ]);
    const client = makeClient({
      entries: [makeEntry('leaf-link-1')],
      includes: {
        Entry: [makeEntry('deeper-entry-1')],
        Asset: [makeAsset('deeper-asset-1')],
      },
    });

    await addLeafReferencesToExperience(
      {entityStore: store} as any,
      client,
      'en-US',
    );

    expect(store.getEntityFromLink(entryLink('deeper-entry-1'))).toBeDefined();
    expect(store.getEntityFromLink(assetLink('deeper-asset-1'))).toBeDefined();
  });

  it('does not call Contentful when every reference resolves', async () => {
    const store = new FakeEntityStore([
      makeEntry('unit-1', {primaryLinkRef: entryLink('link-1')}),
      makeEntry('link-1'),
    ]);
    const client = makeClient();

    await addLeafReferencesToExperience(
      {entityStore: store} as any,
      client,
      'en-US',
    );

    expect(client.withoutLinkResolution.getEntries).not.toHaveBeenCalled();
    expect(client.getAssets).not.toHaveBeenCalled();
  });

  it('is a no-op when the experience has no entity store', async () => {
    const client = makeClient();
    await expect(
      addLeafReferencesToExperience({} as any, client, 'en-US'),
    ).resolves.toBeUndefined();
    expect(client.withoutLinkResolution.getEntries).not.toHaveBeenCalled();
  });
});
