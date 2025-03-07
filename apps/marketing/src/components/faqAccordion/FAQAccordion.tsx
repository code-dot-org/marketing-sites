import '@code-dot-org/component-library/accordion/faqAccordion/index.css';
import FAQAccordion from '@code-dot-org/component-library/accordrion/faqAccordion';
import React, {ReactNode} from 'react';

type FAQAccordionContentfulProps = {
  faqs: {
    id: string;
    slide: ReactNode;
    fields: {
      videoTitle: string;
      youTubeId: string;
      videoFallbackFile: {fields: {file: {url: string}}};
    };
  }[];
  faqItems: unknown[];
};

const FAQAccordionContentful: React.FunctionComponent<
  FAQAccordionContentfulProps
> = ({faqs, ...props}) => {
  console.log('FAQ AccordionContentful', faqs);
  console.log('FAQ AccordionContentful PROPS', props);
  console.log('---------------');

  return (
    <FAQAccordion
      items={[
        {
          id: 'what-is-code-org',
          label: 'What is Code.org?',
          questionString: 'What is Code.org?',
          content:
            'Code.org is a nonprofit dedicated to expanding access to computer science in schools and increasing participation by young women and students from underrepresented groups.',
          answerString:
            'Code.org is a nonprofit dedicated to expanding access to computer science in schools and increasing participation by young women and students from underrepresented groups.',
        },
        {
          id: 'how-can-i-start-learning',
          label: 'How can I start learning?',
          questionString: 'How can I start learning?',
          content:
            'You can start learning by exploring our free online courses available for all age groups and skill levels.',
          answerString:
            'You can start learning by exploring our free online courses available for all age groups and skill levels.',
        },
        {
          id: 'is-code-org-curriculum-free',
          label: 'Is Code.org curriculum free?',
          questionString: 'Is Code.org curriculum free?',
          content:
            'Yes! Code.org provides free curriculum and tools for teachers to use in classrooms.',
          answerString:
            'Yes! Code.org provides free curriculum and tools for teachers to use in classrooms.',
        },
      ]}
      {...props}
    />
  );
};

export default FAQAccordionContentful;
