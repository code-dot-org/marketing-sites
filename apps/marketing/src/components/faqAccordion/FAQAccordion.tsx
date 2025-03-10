import {EntryFields, BaseEntry} from 'contentful';
import '@code-dot-org/component-library/accordion/faqAccordion/index.css';
import FAQAccordion, {
  FAQAccordionItem,
} from '@code-dot-org/component-library/accordrion/faqAccordion';
import React, {useMemo} from 'react';

type FAQAccordionContentfulProps = {
  faqs: (BaseEntry & {
    fields: {
      question: EntryFields.Text | EntryFields.RichText;
      answer: EntryFields.Text | EntryFields.RichText;
    };
  })[];
};

const checkIfEntryFieldIsRichText = (
  entry: BaseEntry & {
    fields: {[key: string]: EntryFields.Text | EntryFields.RichText};
  },
  fieldName: string,
) =>
  typeof entry.fields[fieldName] !== 'string' &&
  'content' in entry.fields[fieldName];

const FAQAccordionContentful: React.FunctionComponent<
  FAQAccordionContentfulProps
> = ({faqs}) => {
  const faqItems = useMemo(() => {
    return faqs.map(faq => {
      let id, question, questionString, answer, answerString;

      if (checkIfEntryFieldIsRichText(faq, 'question')) {
        question =
          'Rich Text is not supported yet. Please use Text type instead';
        questionString = question;
        id = 'rich-text-not-supported';
        console.log(
          'FAQ AccordionContentful RichText',
          (faq.fields.question as EntryFields.RichText).content,
        );
      } else {
        question = faq.fields.question as string;
        questionString = question;
        id = question.replace(' ', '-').toLowerCase();
      }

      if (checkIfEntryFieldIsRichText(faq, 'answer')) {
        console.log(
          'FAQ AccordionContentful RichText',
          (faq.fields.answer as EntryFields.RichText).content,
        );
        answer = 'Rich Text is not supported yet. Please use Text type instead';
        answerString = answer;
      } else {
        answer = faq.fields.answer as string;
        answerString = answer;
      }

      return {
        id,
        label: question,
        questionString,
        content: answer,
        answerString,
      } as FAQAccordionItem;
    });
  }, [faqs]);

  console.log('FAQ AccordionContentful', faqs);
  console.log(
    faqs.map(faq => faq.fields.question),
    faqs.map(faq => faq.fields.answer),
  );
  faqs.forEach(faq => {
    if (
      typeof faq.fields.answer !== 'string' &&
      'content' in faq.fields.answer
    ) {
      console.log(faq.metadata);
      console.log(faq.sys);

      console.log(
        'FAQ AccordionContentful RichText',
        faq.fields.answer.content,
      );
    }
  });
  // console.log('FAQ AccordionContentful PROPS', props);
  console.log('---------------');

  return <FAQAccordion items={faqItems} />;
};

export default FAQAccordionContentful;
