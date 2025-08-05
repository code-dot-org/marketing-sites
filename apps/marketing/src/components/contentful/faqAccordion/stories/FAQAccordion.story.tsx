/* eslint-disable @typescript-eslint/no-explicit-any */

import {Meta, StoryObj} from '@storybook/react';

import FAQAccordionContentful, {
  FAQAccordionContentfulProps,
} from '../FAQAccordion';

const meta: Meta<FAQAccordionContentfulProps> = {
  title: 'Marketing/FAQAccordion',
  component: FAQAccordionContentful,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<FAQAccordionContentfulProps>;

export const FilledOut: Story = {
  args: {
    faqs: [
      {
        metadata: {
          tags: [],
          concepts: [],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '51urVYxgf4qqIZy5jWkgRk',
          type: 'Entry',
          createdAt: '2025-05-28T11:34:56.311Z',
          updatedAt: '2025-07-23T18:10:14.189Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 34,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'faq',
            },
          },
          locale: 'en-US',
        },
        fields: {
          internalName: '❌ [ENG] FAQ Text',
          question: 'FAQ Text',
          answer: {
            data: {},
            content: [
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [],
                    value: 'Normal text',
                    nodeType: 'text',
                  },
                ],
                nodeType: 'paragraph',
              },
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [
                      {
                        type: 'bold',
                      },
                    ],
                    value: 'Bold text',
                    nodeType: 'text',
                  },
                ],
                nodeType: 'paragraph',
              },
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [
                      {
                        type: 'italic',
                      },
                    ],
                    value: 'Italic text',
                    nodeType: 'text',
                  },
                ],
                nodeType: 'paragraph',
              },
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [
                      {
                        type: 'italic',
                      },
                      {
                        type: 'bold',
                      },
                    ],
                    value: 'Bold Italic text',
                    nodeType: 'text',
                  },
                ],
                nodeType: 'paragraph',
              },
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [],
                    value: 'Multiline\n',
                    nodeType: 'text',
                  },
                  {
                    data: {},
                    marks: [
                      {
                        type: 'bold',
                      },
                    ],
                    value: 'complex ',
                    nodeType: 'text',
                  },
                  {
                    data: {},
                    marks: [
                      {
                        type: 'italic',
                      },
                    ],
                    value: 'text',
                    nodeType: 'text',
                  },
                ],
                nodeType: 'paragraph',
              },
            ],
            nodeType: 'document',
          },
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '19LOg2OhaQROxsIT7ATjqc',
          type: 'Entry',
          createdAt: '2025-05-28T11:35:04.082Z',
          updatedAt: '2025-07-23T18:10:14.160Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 35,
          revision: 15,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'faq',
            },
          },
          locale: 'en-US',
        },
        fields: {
          internalName: '❌ [ENG] FAQ Lists',
          question: 'FAQ Lists',
          answer: {
            data: {},
            content: [
              {
                data: {},
                content: [
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        content: [
                          {
                            data: {},
                            marks: [],
                            value: 'Unordered Item A',
                            nodeType: 'text',
                          },
                        ],
                        nodeType: 'paragraph',
                      },
                    ],
                    nodeType: 'list-item',
                  },
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        content: [
                          {
                            data: {},
                            marks: [
                              {
                                type: 'bold',
                              },
                            ],
                            value: 'Unordered Item B',
                            nodeType: 'text',
                          },
                        ],
                        nodeType: 'paragraph',
                      },
                    ],
                    nodeType: 'list-item',
                  },
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        content: [
                          {
                            data: {},
                            marks: [
                              {
                                type: 'italic',
                              },
                            ],
                            value: 'Unordered Item C',
                            nodeType: 'text',
                          },
                        ],
                        nodeType: 'paragraph',
                      },
                    ],
                    nodeType: 'list-item',
                  },
                ],
                nodeType: 'unordered-list',
              },
              {
                data: {},
                content: [
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        content: [
                          {
                            data: {},
                            marks: [],
                            value: 'Ordered Item 1',
                            nodeType: 'text',
                          },
                        ],
                        nodeType: 'paragraph',
                      },
                    ],
                    nodeType: 'list-item',
                  },
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        content: [
                          {
                            data: {},
                            marks: [
                              {
                                type: 'bold',
                              },
                            ],
                            value: 'Ordered Item 2',
                            nodeType: 'text',
                          },
                        ],
                        nodeType: 'paragraph',
                      },
                    ],
                    nodeType: 'list-item',
                  },
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        content: [
                          {
                            data: {},
                            marks: [
                              {
                                type: 'italic',
                              },
                            ],
                            value: 'Ordered Item 3',
                            nodeType: 'text',
                          },
                        ],
                        nodeType: 'paragraph',
                      },
                    ],
                    nodeType: 'list-item',
                  },
                ],
                nodeType: 'ordered-list',
              },
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [],
                    value: '',
                    nodeType: 'text',
                  },
                ],
                nodeType: 'paragraph',
              },
            ],
            nodeType: 'document',
          },
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '7rV1ujJgi05fYtqIEKagMm',
          type: 'Entry',
          createdAt: '2025-05-28T11:35:11.031Z',
          updatedAt: '2025-07-23T18:10:14.128Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 34,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'faq',
            },
          },
          locale: 'en-US',
        },
        fields: {
          internalName: '❌ [ENG] FAQ Links',
          question: 'FAQ Links',
          answer: {
            data: {},
            content: [
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [],
                    value: '',
                    nodeType: 'text',
                  },
                  {
                    data: {
                      uri: 'https://code.org',
                    },
                    content: [
                      {
                        data: {},
                        marks: [],
                        value: 'Normal link',
                        nodeType: 'text',
                      },
                    ],
                    nodeType: 'hyperlink',
                  },
                  {
                    data: {},
                    marks: [],
                    value: '',
                    nodeType: 'text',
                  },
                ],
                nodeType: 'paragraph',
              },
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [
                      {
                        type: 'bold',
                      },
                    ],
                    value: '',
                    nodeType: 'text',
                  },
                  {
                    data: {
                      uri: 'https://code.org',
                    },
                    content: [
                      {
                        data: {},
                        marks: [
                          {
                            type: 'bold',
                          },
                        ],
                        value: 'Bold link',
                        nodeType: 'text',
                      },
                    ],
                    nodeType: 'hyperlink',
                  },
                  {
                    data: {},
                    marks: [],
                    value: '',
                    nodeType: 'text',
                  },
                ],
                nodeType: 'paragraph',
              },
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [
                      {
                        type: 'italic',
                      },
                    ],
                    value: '',
                    nodeType: 'text',
                  },
                  {
                    data: {
                      uri: 'https://code.org',
                    },
                    content: [
                      {
                        data: {},
                        marks: [
                          {
                            type: 'italic',
                          },
                        ],
                        value: 'Italic link',
                        nodeType: 'text',
                      },
                    ],
                    nodeType: 'hyperlink',
                  },
                  {
                    data: {},
                    marks: [],
                    value: '',
                    nodeType: 'text',
                  },
                ],
                nodeType: 'paragraph',
              },
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [
                      {
                        type: 'bold',
                      },
                      {
                        type: 'italic',
                      },
                    ],
                    value: '',
                    nodeType: 'text',
                  },
                  {
                    data: {
                      uri: 'https://code.org',
                    },
                    content: [
                      {
                        data: {},
                        marks: [
                          {
                            type: 'bold',
                          },
                          {
                            type: 'italic',
                          },
                        ],
                        value: 'Bold Italic link',
                        nodeType: 'text',
                      },
                    ],
                    nodeType: 'hyperlink',
                  },
                  {
                    data: {},
                    marks: [],
                    value: '',
                    nodeType: 'text',
                  },
                ],
                nodeType: 'paragraph',
              },
            ],
            nodeType: 'document',
          },
        },
      },
    ] as any,
  },
};
