import type {Meta, StoryObj, StoryFn} from '@storybook/react';
import {within, expect} from '@storybook/test';

import FAQAccordion, {FAQAccordionProps} from '../index';

export default {
  title: 'CMS/FAQ Accordion',
  component: FAQAccordion,
} as Meta;

type Story = StoryObj<typeof FAQAccordion>;

//
// TEMPLATE
//
const MultipleTemplate: StoryFn<{components: FAQAccordionProps[]}> = args => (
  <>
    {args.components.map((component, index) => (
      <FAQAccordion key={index} {...component} />
    ))}
  </>
);

//
// STORIES
//

export const DefaultFAQAccordion: Story = {
  args: {
    items: [
      {
        question: 'What is Code.org?',
        answer:
          'Code.org is a nonprofit dedicated to expanding access to computer science in schools and increasing participation by young women and students from underrepresented groups.',
      },
      {
        question: 'How can I start learning?',
        answer:
          'You can start learning by exploring our free online courses available for all age groups and skill levels.',
      },
      {
        question: 'Is Code.org curriculum free?',
        answer:
          'Yes! Code.org provides free curriculum and tools for teachers to use in classrooms.',
      },
    ],
  },
  play: ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);

    // Check if all questions are in the document
    const questions = [
      'What is Code.org?',
      'How can I start learning?',
      'Is Code.org curriculum free?',
    ];

    questions.forEach(async questionText => {
      const question = await canvas.findByText(questionText);
      expect(question).toBeInTheDocument();
    });
  },
};

export const FAQAccordionWithLongAnswers: Story = {
  args: {
    items: [
      {
        question: 'How does Code.org support teachers?',
        answer:
          'Code.org provides free curriculum, professional learning programs, and tools to help teachers integrate computer science into their classrooms effectively.',
      },
      {
        question: 'Are there coding resources for beginners?',
        answer:
          'Yes! Code.org offers a variety of beginner-friendly resources, including Hour of Code activities, introductory courses, and self-paced learning materials.',
      },
    ],
  },
};

export const FAQAccordionWithSingleItem: Story = {
  args: {
    items: [
      {
        question: 'Can I contribute to Code.org?',
        answer:
          'Absolutely! You can contribute by volunteering, donating, or sharing our resources with your community.',
      },
    ],
  },
  play: async ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);

    const question = await canvas.findByText('Can I contribute to Code.org?');
    expect(question).toBeInTheDocument();
  },
};

export const MultipleFAQAccordions = MultipleTemplate.bind({});
MultipleFAQAccordions.args = {
  components: [
    {
      items: [
        {
          question: 'What languages can I learn on Code.org?',
          answer:
            'You can learn block-based coding, JavaScript, Python, and more!',
        },
        {
          question: 'Are the courses self-paced?',
          answer:
            'Yes, you can learn at your own pace with our interactive courses.',
        },
      ],
    },
    {
      items: [
        {
          question: 'Do I need prior experience to start?',
          answer:
            'No experience is needed! Our courses are designed for beginners and experienced learners alike.',
        },
        {
          question: 'How do I track my progress?',
          answer:
            'You can create an account on Code.org and track your progress on your dashboard.',
        },
      ],
    },
  ],
};
MultipleFAQAccordions.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const questions = [
    'What languages can I learn on Code.org?',
    'Are the courses self-paced?',
    'Do I need prior experience to start?',
    'How do I track my progress?',
  ];

  questions.forEach(async questionText => {
    const question = await canvas.findByText(questionText);
    expect(question).toBeInTheDocument();
  });
};
