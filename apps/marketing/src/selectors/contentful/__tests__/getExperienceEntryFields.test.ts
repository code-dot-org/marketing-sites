import {Experience} from '@contentful/experiences-sdk-react';

import {
  getExperienceEntryFieldsFromExperience,
  getMetaTitleFromExperience,
  getMetaDescFromExperience,
  getOpengraphImageFromExperience,
  getNoIndexFromExperience,
} from '../getExperienceEntryFields';

const mockExperience: Experience = {
  entityStore: {
    experienceEntryFields: {},
  },
} as Experience;

function buildExperience(fields: Record<string, unknown>): Experience {
  return {
    ...mockExperience,
    entityStore: {
      ...mockExperience.entityStore,
      experienceEntryFields: fields,
    },
  } as unknown as Experience;
}

describe('getExperienceEntryFieldsFromExperience', () => {
  it('should return experienceEntryFields when experience is defined', () => {
    const experience = buildExperience({metaTitle: 'Test Title'});
    const result = getExperienceEntryFieldsFromExperience(experience);
    expect(result).toEqual({metaTitle: 'Test Title'});
  });

  it('should return undefined when experience is undefined', () => {
    const result = getExperienceEntryFieldsFromExperience(undefined);
    expect(result).toBeUndefined();
  });
});

describe('getMetaTitleFromExperience', () => {
  it('returns metaTitle when set', () => {
    const experience = buildExperience({metaTitle: 'Test Title'});
    expect(getMetaTitleFromExperience(experience)).toBe('Test Title');
  });

  it('returns undefined when missing', () => {
    expect(getMetaTitleFromExperience(buildExperience({}))).toBeUndefined();
  });
});

describe('getMetaDescFromExperience', () => {
  it('returns metaDesc when set', () => {
    const experience = buildExperience({metaDesc: 'Test Description'});
    expect(getMetaDescFromExperience(experience)).toBe('Test Description');
  });

  it('returns undefined when missing', () => {
    expect(getMetaDescFromExperience(buildExperience({}))).toBeUndefined();
  });
});

describe('getOpengraphImageFromExperience', () => {
  it('returns opengraphImage when set', () => {
    const image = {fields: {file: {url: '/img.jpg'}}};
    const experience = buildExperience({opengraphImage: image});
    expect(getOpengraphImageFromExperience(experience)).toEqual(image);
  });

  it('returns undefined when missing', () => {
    expect(
      getOpengraphImageFromExperience(buildExperience({})),
    ).toBeUndefined();
  });
});

describe('getNoIndexFromExperience', () => {
  it('returns true when set true', () => {
    expect(getNoIndexFromExperience(buildExperience({noIndex: true}))).toBe(
      true,
    );
  });

  it('returns false when set false', () => {
    expect(getNoIndexFromExperience(buildExperience({noIndex: false}))).toBe(
      false,
    );
  });

  it('returns undefined when missing (callers should treat as indexable)', () => {
    expect(getNoIndexFromExperience(buildExperience({}))).toBeUndefined();
  });
});
