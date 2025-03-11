import {EntryFields, BaseEntry} from 'contentful';
import '@code-dot-org/component-library/accordion/faqAccordion/index.css';
import FAQAccordion, {
  FAQAccordionItem,
} from '@code-dot-org/component-library/accordrion/faqAccordion';
import {useMemo} from 'react';

type FAQAccordionContentfulProps = {
  faqs?: (BaseEntry & {
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
  const faqItems = useMemo(
    () =>
      faqs?.filter(Boolean).map(faq => {
        let id, question, questionString, answer, answerString;

        if (checkIfEntryFieldIsRichText(faq, 'question')) {
          question =
            'Rich Text is not supported yet. Please use Text type instead';
          questionString = question;
          id = 'rich-text-not-supported-yet';
        } else {
          question = faq.fields.question as string;
          questionString = question;
          id = question.replace(' ', '-').toLowerCase();
        }

        if (checkIfEntryFieldIsRichText(faq, 'answer')) {
          answer =
            'Rich Text is not supported yet. Please use Text type instead';
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
      }) || [],
    [faqs],
  );

  // Workaround for the experience builder not working with Array
  if (!faqItems.length) {
    return (
      <div>
        <em>
          <strong>✍ FAQ Accordion placeholder.</strong> Please add a "FAQs"
          content type entry in the FAQ Accordion sidebar, save, and open the
          preview tab to see the carousel. An empty FAQ Accordion will show in
          this editor, but it's here.
        </em>
      </div>
    );
  }

  return <FAQAccordion items={faqItems} />;
};

export default FAQAccordionContentful;
