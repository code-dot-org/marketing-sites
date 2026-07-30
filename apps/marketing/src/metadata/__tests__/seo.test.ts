import {Experience} from '@contentful/experiences-sdk-react';
import {Metadata} from 'next';

import {Brand} from '@/config/brand';
import {resolveSeoFields, ResolvedSeoFields} from '@/metadata/resolveSeoFields';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {getSeoMetadata} from '../seo';

jest.mock('@/metadata/resolveSeoFields', () => ({
  resolveSeoFields: jest.fn(),
}));
jest.mock('@/selectors/contentful/getImage', () => ({
  getAbsoluteImageUrl: jest.fn(),
}));

const mockOpengraphImage: ExperienceAsset = {
  fields: {
    file: {
      contentType: 'image/jpeg',
      fileName: 'test-image.jpg',
      url: '/test-image.jpg',
      details: {
        size: 0,
        image: {
          width: 1200,
          height: 630,
        },
      },
    },
  },
} as ExperienceAsset;

const mockExperience: Experience = {} as Experience;

function mockResolvedSeo(overrides: Partial<ResolvedSeoFields> = {}) {
  const defaults: ResolvedSeoFields = {
    title: 'Test Title',
    description: 'Test Description',
    ogTitle: 'Test Title',
    ogDescription: 'Test Description',
    ogImage: mockOpengraphImage,
    noIndex: false,
    noFollow: false,
  };
  (resolveSeoFields as jest.Mock).mockReturnValue({...defaults, ...overrides});
}

describe('getSeoMetadata', () => {
  beforeEach(() => {
    mockResolvedSeo();
    (getAbsoluteImageUrl as jest.Mock).mockReturnValue(
      'https://example.com/test-image.jpg',
    );
  });

  it('returns full metadata when experience fields are populated', () => {
    const result = getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      'engineering/all-the-things',
    );

    expect(result).toEqual<Metadata>({
      title: 'Test Title',
      description: 'Test Description',
      alternates: {
        canonical: 'https://code.org/en-US/engineering/all-the-things',
      },
      openGraph: {
        type: 'website',
        locale: 'en-US',
        title: 'Test Title',
        description: 'Test Description',
        url: './',
        images: 'https://example.com/test-image.jpg',
      },
      robots: {
        index: true,
        follow: true,
      },
    });
  });

  it('omits title when the resolved title is undefined', () => {
    mockResolvedSeo({title: undefined});

    const result = getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      'engineering/all-the-things',
    );

    expect(result.title).toBeUndefined();
  });

  it('emits keywords when present', () => {
    mockResolvedSeo({keywords: ['computer science', 'education']});

    const result = getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      'engineering/all-the-things',
    );

    expect(result.keywords).toEqual(['computer science', 'education']);
  });

  it('omits keywords when empty', () => {
    mockResolvedSeo({keywords: []});

    const result = getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      'engineering/all-the-things',
    );

    expect(result).not.toHaveProperty('keywords');
  });

  it('falls back to brand default OG image when ogImage is missing', () => {
    mockResolvedSeo({ogImage: undefined});

    const result = getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      '/engineering/all-the-things',
    );

    expect(result.openGraph?.images).toBe(
      'https://contentful-images.code.org/90t6bu6vlf76/6QAykNTAjFdgHya4lBchyF/f2afa0254f89188206e45c223910b412/codeai_default_opengraph.png',
    );
  });

  it('leaves OG image undefined when no brand default exists and no image set', () => {
    mockResolvedSeo({ogImage: undefined});

    const result = getSeoMetadata(
      mockExperience,
      'incorrect brand' as Brand,
      'en-US',
      '/engineering/all-the-things',
    );

    expect(result.openGraph?.images).toBeUndefined();
  });

  it('sets noindex+nofollow together when both flags are set', () => {
    mockResolvedSeo({noIndex: true, noFollow: true});

    const result = getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      '/engineering/all-the-things',
    );

    expect(result.robots).toEqual({index: false, follow: false});
  });

  // LEGACY-ENV-COMPAT: the old environment has independent noindex/nofollow flags.
  it('supports nofollow independently of noindex', () => {
    mockResolvedSeo({noIndex: false, noFollow: true});

    const result = getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      '/engineering/all-the-things',
    );

    expect(result.robots).toEqual({index: true, follow: false});
  });

  it('calls getAbsoluteImageUrl with fm=webp for the OG image', () => {
    getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      '/engineering/all-the-things',
    );
    expect(getAbsoluteImageUrl).toHaveBeenCalledWith(mockOpengraphImage, {
      fm: 'webp',
    });
  });
});
