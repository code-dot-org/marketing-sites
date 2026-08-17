import {Experience} from '@contentful/experiences-sdk-react';

import {resolveSeoFields} from '../resolveSeoFields';

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
});
