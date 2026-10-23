/**
 * @jest-environment node
 */
import {search} from '@orama/orama';

import {Activity} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

import {createDatabase, toOramaActivities} from '../createDatabase';

jest.mock('@/selectors/contentful/getImage', () => ({
  getAbsoluteImageUrl: jest.fn(img =>
    img ? `https://cdn.example.com/${img}` : '',
  ),
}));

const mockActivities = [
  {
    fields: {
      title: 'Activity 1',
      image: 'img1.png',
      organization: 'Org1',
      ages: ['8-10'],
      languageProgramming: ['JavaScript'],
      shortDescription: 'Short desc 1',
      longDescription: 'Long desc 1',
      technologyClassroom: ['Tablet'],
      topic: ['Math'],
      activityType: ['Game'],
      length: ['30min'],
      accessibilitys: ['Screen Reader'],
      languagesText: 'English',
      standards: 'CCSS',
      tutorialID: 'tut1',
      primaryLinkRef: 'https://studio.code.org/1',
    },
  },
  {
    fields: {
      title: 'Activity 2',
      organization: 'Org2',
      ages: [],
      languageProgramming: [],
      shortDescription: '',
      longDescription: '',
      technologyClassroom: [],
      topic: [],
      activityType: [],
      length: [],
      accessibilitys: [],
      languagesText: '',
      standards: '',
      tutorialID: '',
      primaryLinkRef: '',
    },
  },
] as unknown as Entry<Activity>[];

describe('createDatabase', () => {
  it('should create a database and insert activities', async () => {
    const db = createDatabase(toOramaActivities(mockActivities));

    const result = await search(db, {term: 'Activity', properties: ['title']});
    expect(result.hits.length).toBe(2);
    expect(result.hits[0].document.title).toBe('Activity 1');
    expect(result.hits[1].document.title).toBe('Activity 2');
  });

  it('should handle missing fields and default values', async () => {
    const db = createDatabase(toOramaActivities([mockActivities[1]]));
    const result = await search(db, {
      term: 'Activity 2',
      properties: ['title'],
    });
    expect(result.hits.length).toBe(1);
    const doc = result.hits[0].document;
    expect(doc.image).toBe('');
    expect(doc.ages).toEqual([]);
    expect(doc.languageProgramming).toEqual([]);
    expect(doc.shortDescription).toBe('');
  });

  it('should stringify primaryLinkRef', async () => {
    const db = createDatabase(toOramaActivities([mockActivities[0]]));
    const result = await search(db, {
      term: 'Activity 1',
      properties: ['title'],
    });
    expect(result.hits.length).toBe(1);
    expect(result.hits[0].document.primaryLinkRef).toBe(
      JSON.stringify('https://studio.code.org/1'),
    );
  });

  it('should use getAbsoluteImageUrl for image field', async () => {
    const db = createDatabase(toOramaActivities([mockActivities[0]]));
    const result = await search(db, {
      term: 'Activity 1',
      properties: ['title'],
    });
    expect(result.hits[0].document.image).toBe(
      'https://cdn.example.com/img1.png',
    );
  });

  it('keeps only the fields of link entries', () => {
    const [doc] = toOramaActivities([
      {
        fields: {
          title: 'Activity 3',
          primaryLinkRef: {
            sys: {id: 'link-1'},
            metadata: {tags: []},
            fields: {label: 'Start', primaryTarget: 'https://example.com'},
          },
          secondaryLinkRef: {
            sys: {id: 'link-2'},
            fields: {label: 'Teach', primaryTarget: 'https://example.org'},
          },
        },
      },
    ] as unknown as Entry<Activity>[]);

    expect(JSON.parse(doc.primaryLinkRef)).toEqual({
      fields: {label: 'Start', primaryTarget: 'https://example.com'},
    });
    expect(JSON.parse(doc.secondaryLinkRef!)).toEqual({
      fields: {label: 'Teach', primaryTarget: 'https://example.org'},
    });
  });

  describe('catalogs', () => {
    const tagged = (title: string, tags: string[], featuredPosition?: number) =>
      ({
        metadata: {
          tags: tags.map(id => ({sys: {id, type: 'Link', linkType: 'Tag'}})),
        },
        fields: {
          title,
          organization: 'Org',
          featuredPosition,
          primaryLinkRef: '',
        },
      }) as unknown as Entry<Activity>;

    const docs = toOramaActivities([
      tagged('Hello World', ['hour-of-code'], 1),
      tagged('Mix & Move', ['hour-of-ai'], 1),
      tagged('Minecraft', ['hour-of-ai', 'hour-of-code'], 6),
      tagged('Untagged', []),
      tagged('Other tag', ['some-other-tag']),
    ]);

    it('reads catalogs from the Hour of AI and Hour of Code tags', () => {
      expect(docs.map(doc => doc.catalogs)).toEqual([
        ['hour-of-code'],
        ['hour-of-ai'],
        ['hour-of-ai', 'hour-of-code'],
        [],
        [],
      ]);
    });

    it('sorts both catalogs together by position, then title', async () => {
      const result = await search(createDatabase(docs), {
        sortBy: {property: 'sortKey', order: 'ASC'},
      });

      expect(result.hits.map(hit => hit.document.title)).toEqual([
        'Hello World',
        'Mix & Move',
        'Minecraft',
        'Other tag',
        'Untagged',
      ]);
    });

    it('keeps each catalog in its own featured order', async () => {
      const result = await search(createDatabase(docs), {
        where: {catalogs: {containsAny: ['hour-of-code']}},
        sortBy: {property: 'sortKey', order: 'ASC'},
      });

      expect(result.hits.map(hit => hit.document.title)).toEqual([
        'Hello World',
        'Minecraft',
      ]);
    });
  });

  it('should return an Orama database instance', () => {
    const db = createDatabase([]);
    expect(db).toBeDefined();
    expect(typeof db).toBe('object');
  });
});
