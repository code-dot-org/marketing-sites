import {Experience} from '@contentful/experiences-sdk-react';
import {Metadata} from 'next';

import {Brand} from '@/config/brand';
import {
  getMetaDescFromExperience,
  getMetaTitleFromExperience,
  getNoIndexFromExperience,
  getOpengraphImageFromExperience,
} from '@/selectors/contentful/getExperienceEntryFields';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {getSeoMetadata} from '../seo';

jest.mock('@/selectors/contentful/getExperienceEntryFields', () => ({
  getMetaTitleFromExperience: jest.fn(),
  getMetaDescFromExperience: jest.fn(),
  getOpengraphImageFromExperience: jest.fn(),
  getNoIndexFromExperience: jest.fn(),
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

function mockSelectors(
  overrides: Partial<{
    metaTitle: string | undefined;
    metaDesc: string | undefined;
    opengraphImage: ExperienceAsset | undefined;
    noIndex: boolean | undefined;
  }> = {},
) {
  const defaults = {
    metaTitle: 'Test Title' as string | undefined,
    metaDesc: 'Test Description' as string | undefined,
    opengraphImage: mockOpengraphImage as ExperienceAsset | undefined,
    noIndex: undefined as boolean | undefined,
  };
  const final = {...defaults, ...overrides};
  (getMetaTitleFromExperience as jest.Mock).mockReturnValue(final.metaTitle);
  (getMetaDescFromExperience as jest.Mock).mockReturnValue(final.metaDesc);
  (getOpengraphImageFromExperience as jest.Mock).mockReturnValue(
    final.opengraphImage,
  );
  (getNoIndexFromExperience as jest.Mock).mockReturnValue(final.noIndex);
}

describe('getSeoMetadata', () => {
  beforeEach(() => {
    mockSelectors();
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

  it('omits title when metaTitle is undefined', () => {
    mockSelectors({metaTitle: undefined});

    const result = getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      'engineering/all-the-things',
    );

    expect(result.title).toBeUndefined();
  });

  it('falls back to brand default OG image when opengraphImage is missing', () => {
    mockSelectors({opengraphImage: undefined});

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
    mockSelectors({opengraphImage: undefined});

    const result = getSeoMetadata(
      mockExperience,
      'incorrect brand' as Brand,
      'en-US',
      '/engineering/all-the-things',
    );

    expect(result.openGraph?.images).toBeUndefined();
  });

  it('defaults to index+follow when noIndex is undefined', () => {
    mockSelectors({noIndex: undefined});

    const result = getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      '/engineering/all-the-things',
    );

    expect(result.robots).toEqual({index: true, follow: true});
  });

  it('sets noindex+nofollow together when noIndex is true', () => {
    mockSelectors({noIndex: true});

    const result = getSeoMetadata(
      mockExperience,
      Brand.CODE_DOT_ORG,
      'en-US',
      '/engineering/all-the-things',
    );

    expect(result.robots).toEqual({index: false, follow: false});
  });

  it('calls getAbsoluteImageUrl with fm=webp for opengraphImage', () => {
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
