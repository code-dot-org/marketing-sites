import {Experience} from '@contentful/experiences-sdk-react';

import {isLegacyShapeExperience, resolveSeoFields} from '../resolveSeoFields';

function buildExperience(fields: Record<string, unknown>): Experience {
  return {
    entityStore: {
      experienceEntryFields: fields,
    },
  } as unknown as Experience;
}

const ogImage = {fields: {file: {url: '/img.jpg'}}};

describe('resolveSeoFields', () => {
  describe('new shape (flat experience fields)', () => {
    it('maps metaTitle/metaDesc to title, description, and OG fields', () => {
      const result = resolveSeoFields(
        buildExperience({
          metaTitle: 'New Title',
          metaDesc: 'New Description',
          opengraphImage: ogImage,
          noIndex: false,
        }),
      );

      expect(result).toEqual({
        title: 'New Title',
        description: 'New Description',
        ogTitle: 'New Title',
        ogDescription: 'New Description',
        ogImage,
        noIndex: false,
        noFollow: false,
      });
    });

    it('drives both robots flags from the single noIndex flag', () => {
      const result = resolveSeoFields(buildExperience({noIndex: true}));
      expect(result.noIndex).toBe(true);
      expect(result.noFollow).toBe(true);
    });

    it('defaults to indexable for an empty experience', () => {
      const result = resolveSeoFields(buildExperience({}));
      expect(result.noIndex).toBe(false);
      expect(result.noFollow).toBe(false);
      expect(result.title).toBeUndefined();
    });

    it('handles an undefined experience', () => {
      const result = resolveSeoFields(undefined);
      expect(result.noIndex).toBe(false);
      expect(result.title).toBeUndefined();
    });
  });

  // CSFORALL-COMPAT: remove with the legacy branch in resolveSeoFields.ts
  // when csforall is retired.
  describe('legacy shape (pageHeading + linked seoMetadata entry)', () => {
    const legacyFields = {
      pageHeading: 'Page Heading',
      seoMetadata: {
        sys: {type: 'Entry'},
        fields: {
          seoTitle: 'Legacy Title',
          seoDescription: 'Legacy Description',
          keywords: ['cs', 'education'],
          openGraphTitle: 'Legacy OG Title',
          openGraphDescription: 'Legacy OG Description',
          openGraphImage: ogImage,
          hidePageFromSearchEnginesNoindex: false,
          hideLinksFromSearchEnginesNofollow: false,
        },
      },
    };

    it('maps the full legacy seoMetadata entry', () => {
      const result = resolveSeoFields(buildExperience(legacyFields));

      expect(result).toEqual({
        title: 'Legacy Title',
        description: 'Legacy Description',
        keywords: ['cs', 'education'],
        ogTitle: 'Legacy OG Title',
        ogDescription: 'Legacy OG Description',
        ogImage,
        noIndex: false,
        noFollow: false,
      });
    });

    it('falls back to pageHeading for the title when seoTitle is unset', () => {
      const result = resolveSeoFields(
        buildExperience({
          pageHeading: 'Page Heading',
          seoMetadata: {
            sys: {type: 'Entry'},
            fields: {seoDescription: 'Legacy Description'},
          },
        }),
      );

      expect(result.title).toBe('Page Heading');
      expect(result.description).toBe('Legacy Description');
    });

    it('honors independent noindex and nofollow flags', () => {
      const result = resolveSeoFields(
        buildExperience({
          ...legacyFields,
          seoMetadata: {
            sys: {type: 'Entry'},
            fields: {
              hidePageFromSearchEnginesNoindex: true,
              hideLinksFromSearchEnginesNofollow: false,
            },
          },
        }),
      );

      expect(result.noIndex).toBe(true);
      expect(result.noFollow).toBe(false);
    });

    it('treats an unresolved seoMetadata link stub as legacy shape with defaults', () => {
      const result = resolveSeoFields(
        buildExperience({
          pageHeading: 'Page Heading',
          seoMetadata: {sys: {type: 'Link', linkType: 'Entry', id: 'abc'}},
        }),
      );

      expect(result.title).toBe('Page Heading');
      expect(result.description).toBeUndefined();
      expect(result.noIndex).toBe(false);
      expect(result.noFollow).toBe(false);
    });

    it('detects legacy shape from pageHeading alone', () => {
      const result = resolveSeoFields(
        buildExperience({pageHeading: 'Page Heading'}),
      );

      expect(result.title).toBe('Page Heading');
    });
  });

  describe('isLegacyShapeExperience', () => {
    it('is true for the legacy shape', () => {
      expect(
        isLegacyShapeExperience(
          buildExperience({
            seoMetadata: {sys: {type: 'Entry'}, fields: {seoTitle: 'T'}},
          }),
        ),
      ).toBe(true);
      expect(
        isLegacyShapeExperience(buildExperience({pageHeading: 'Heading'})),
      ).toBe(true);
    });

    it('is false for the new shape and empty experiences', () => {
      expect(
        isLegacyShapeExperience(buildExperience({metaTitle: 'New Title'})),
      ).toBe(false);
      expect(isLegacyShapeExperience(buildExperience({}))).toBe(false);
      expect(isLegacyShapeExperience(undefined)).toBe(false);
    });
  });
});
