/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  detachExperienceStyles,
  Experience,
} from '@contentful/experiences-sdk-react';

// Hour of AI's card patterns bind a container background image through a
// pattern's content type binding. SDK 3.x left those images out of the SSR
// stylesheet (fixed in 4.0.1), so they only showed in Studio.

const CARD_IMAGE = 'card-image.png';

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
          // Studio always saves this list; the SDK ignores the binding
          // without it.
          allowedVariableOverrides: [],
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

describe('detachExperienceStyles with a pattern content type binding', () => {
  it('includes the background image of a pattern on the page', () => {
    const experience = makeExperience({
      patternNode: pageNode('cardPattern', 'cardParam'),
      usedComponents: [cardPattern],
    });

    expect(detachExperienceStyles(experience)).toContain(CARD_IMAGE);
  });

  it('includes it for a nested pattern whose exposed variable is empty', () => {
    const experience = makeExperience({
      patternNode: pageNode('rowPattern', 'rowParam', {
        rowImage: {type: 'UnboundValue', key: 'emptyImage'},
      }),
      usedComponents: [rowPattern('rowImage'), cardPattern],
      unboundValues: {emptyImage: {}},
    });

    expect(detachExperienceStyles(experience)).toContain(CARD_IMAGE);
  });

  it('includes it for a nested pattern without an exposed variable', () => {
    const experience = makeExperience({
      patternNode: pageNode('rowPattern', 'rowParam'),
      usedComponents: [rowPattern(), cardPattern],
    });

    expect(detachExperienceStyles(experience)).toContain(CARD_IMAGE);
  });
});
