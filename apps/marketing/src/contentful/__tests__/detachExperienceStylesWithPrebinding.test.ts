/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  detachExperienceStyles,
  Experience,
} from '@contentful/experiences-sdk-react';

import {detachExperienceStylesWithPrebinding} from '@/contentful/detachExperienceStylesWithPrebinding';

const CARD_IMAGE = 'card-image.png';
const MANUAL_IMAGE = 'https://example.com/manual.png';

const designValue = (value: unknown) => ({
  type: 'DesignValue',
  valuesByBreakpoint: {desktop: value},
});

// A card pattern whose image container background is bound, through the
// pattern's content type binding, to the card entry's featured image.
const cardPattern = {
  sys: {id: 'cardPattern', type: 'Entry'},
  fields: {
    componentTree: {
      children: [
        {
          id: 'image',
          definitionId: 'contentful-container',
          variables: {
            cfBackgroundImageUrl: {type: 'ComponentValue', key: 'cardImage'},
            cfBackgroundImageOptions: {
              type: 'ComponentValue',
              key: 'cardImageOptions',
            },
            cfWidth: designValue('100%'),
          },
          children: [],
        },
      ],
    },
    componentSettings: {
      variableDefinitions: {
        cardImage: {
          type: 'Media',
          group: 'content',
          defaultValue: {type: 'UnboundValue', key: 'cardImageDefault'},
        },
        cardImageOptions: {
          type: 'Object',
          group: 'style',
          defaultValue: designValue({
            scaling: 'fill',
            alignment: 'center center',
            targetSize: '2000px',
          }),
        },
      },
      prebindingDefinitions: [
        {
          id: 'cardPrebinding',
          parameterDefinitions: {
            cardParam: {passToNodes: [], contentTypes: ['card']},
          },
          variableMappings: {
            cardImage: {
              type: 'ContentTypeMapping',
              parameterId: 'cardParam',
              pathsByContentType: {
                card: {
                  path: '/fields/featuredImage/~locale/fields/file/~locale',
                },
              },
            },
          },
        },
      ],
    },
    unboundValues: {cardImageDefault: {}},
  },
};

// A row pattern passing its parameter into a nested card. With
// `exposedKey`, the nested card's image is also a variable of the row, as
// Studio sets it up.
const rowPattern = (exposedKey?: string) => ({
  sys: {id: 'rowPattern', type: 'Entry'},
  fields: {
    componentTree: {
      children: [
        {
          id: 'nestedCard',
          definitionId: 'cardPattern',
          variables: exposedKey
            ? {cardImage: {type: 'ComponentValue', key: exposedKey}}
            : {},
          children: [],
        },
      ],
    },
    componentSettings: {
      variableDefinitions: exposedKey
        ? {
            [exposedKey]: {
              type: 'Media',
              group: 'content',
              defaultValue: {type: 'UnboundValue', key: 'rowImageDefault'},
            },
          }
        : {},
      prebindingDefinitions: [
        {
          id: 'rowPrebinding',
          parameterDefinitions: {
            rowParam: {
              passToNodes: [
                {
                  nodeId: 'nestedCard',
                  parameterId: 'cardParam',
                  prebindingId: 'cardPrebinding',
                },
              ],
              contentTypes: ['card'],
            },
          },
        },
      ],
    },
    unboundValues: {rowImageDefault: {}},
  },
});

const makeExperience = ({
  patternNode,
  usedComponents,
  unboundValues = {},
}: {
  patternNode: any;
  usedComponents: any[];
  unboundValues?: Record<string, {value?: unknown}>;
}) => {
  const entityStore = {
    experienceEntryId: 'page',
    isExperienceAPatternEntry: false,
    experienceEntryFields: {
      componentTree: {
        breakpoints: [{id: 'desktop', query: '*', displayName: 'All sizes'}],
        children: [patternNode],
      },
    },
    usedComponents,
    unboundValues,
    dataSource: {
      cardLink: {sys: {type: 'Link', linkType: 'Entry', id: 'card1'}},
    },
    entities: [
      {
        sys: {
          id: 'card1',
          type: 'Entry',
          contentType: {
            sys: {type: 'Link', linkType: 'ContentType', id: 'card'},
          },
        },
        fields: {
          featuredImage: {sys: {type: 'Link', linkType: 'Asset', id: 'asset1'}},
        },
      },
      {
        sys: {id: 'asset1', type: 'Asset'},
        fields: {
          file: {
            url: `//images.example.com/${CARD_IMAGE}`,
            contentType: 'image/png',
            details: {image: {width: 800, height: 450}},
          },
        },
      },
    ],
  };
  return {entityStore} as unknown as Experience;
};

const pageNode = (
  definitionId: string,
  parameterId: string,
  variables = {},
) => ({
  id: 'instance',
  definitionId,
  variables,
  parameters: {[parameterId]: {type: 'BoundValue', path: '/cardLink'}},
  children: [],
});

const withoutClassNames = (experience: Experience) =>
  JSON.stringify(experience, (key, value) =>
    key === 'cfSsrClassName' ? undefined : value,
  );

describe('detachExperienceStylesWithPrebinding', () => {
  it('adds a prebound background image for a pattern on the page', () => {
    const experience = makeExperience({
      patternNode: pageNode('cardPattern', 'cardParam'),
      usedComponents: [cardPattern],
    });

    expect(detachExperienceStylesWithPrebinding(experience)).toContain(
      CARD_IMAGE,
    );
  });

  // When this fails, the SDK handles prebinding: remove the workaround.
  it('is still needed: the SDK alone drops the image', () => {
    const experience = makeExperience({
      patternNode: pageNode('cardPattern', 'cardParam'),
      usedComponents: [cardPattern],
    });

    expect(detachExperienceStyles(experience)).not.toContain(CARD_IMAGE);
  });

  it('fills an exposed variable a nested pattern left empty', () => {
    const experience = makeExperience({
      patternNode: pageNode('rowPattern', 'rowParam', {
        rowImage: {type: 'UnboundValue', key: 'emptyImage'},
      }),
      usedComponents: [rowPattern('rowImage'), cardPattern],
      unboundValues: {emptyImage: {}},
    });

    expect(detachExperienceStylesWithPrebinding(experience)).toContain(
      CARD_IMAGE,
    );
  });

  it('routes a nested pattern without an exposed variable', () => {
    const experience = makeExperience({
      patternNode: pageNode('rowPattern', 'rowParam'),
      usedComponents: [rowPattern(), cardPattern],
    });

    expect(detachExperienceStylesWithPrebinding(experience)).toContain(
      CARD_IMAGE,
    );
  });

  it('keeps an image an author set manually', () => {
    const experience = makeExperience({
      patternNode: pageNode('rowPattern', 'rowParam', {
        rowImage: {type: 'UnboundValue', key: 'manualImage'},
      }),
      usedComponents: [rowPattern('rowImage'), cardPattern],
      unboundValues: {manualImage: {value: MANUAL_IMAGE}},
    });

    const stylesheet = detachExperienceStylesWithPrebinding(experience);

    expect(stylesheet).toContain(MANUAL_IMAGE);
    expect(stylesheet).not.toContain(CARD_IMAGE);
  });

  it.each([
    ['an exposed variable', 'rowImage'],
    ['a routed variable', undefined],
  ])(
    'leaves the experience as it found it with %s, apart from class names',
    (_, exposedKey) => {
      const experience = makeExperience({
        patternNode: pageNode('rowPattern', 'rowParam', {
          rowImage: {type: 'UnboundValue', key: 'emptyImage'},
        }),
        usedComponents: [rowPattern(exposedKey), cardPattern],
        unboundValues: {emptyImage: {}},
      });
      const before = withoutClassNames(experience);

      expect(detachExperienceStylesWithPrebinding(experience)).toContain(
        CARD_IMAGE,
      );
      expect(withoutClassNames(experience)).toBe(before);
    },
  );
});
