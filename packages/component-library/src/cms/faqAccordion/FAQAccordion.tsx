import {useState} from 'react';
import classNames from 'classnames';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './faqAccordion.module.scss';
import {BodyTwoText, StrongText} from '@/typography';

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQAccordionProps = {
  /** List of FAQ items */
  items: FAQItem[];
  /** Custom className for additional styling */
  className?: string;
};

const FAQAccordion: React.FC<FAQAccordionProps> = ({items, className}) => {
  const [openQuestion, setOpenIndex] = useState<string | null>(null);

  const toggleFAQ = (question: string) => {
    setOpenIndex(openQuestion => (openQuestion === question ? null : question));
  };

  return (
    <section className={classNames(moduleStyles.faqAccordion, className)}>
      <div className={moduleStyles.farAccordion}>
        {items.map(({question, answer}) => (
          <details
            key={question}
            className={classNames(moduleStyles.faqItem, {
              [moduleStyles.faqItemOpen]: openQuestion === question,
            })}
          >
            <summary
              className={moduleStyles.faqQuestion}
              onClick={() => toggleFAQ(question)}
              aria-expanded={openQuestion === question}
            >
              <BodyTwoText>
                <StrongText>{question}</StrongText>
              </BodyTwoText>
              <FontAwesomeV6Icon
                iconName={
                  openQuestion === question ? 'chevron-up' : 'chevron-down'
                }
              />
            </summary>
            <BodyTwoText>{answer}</BodyTwoText>
          </details>
        ))}
      </div>

      {/* JSON-LD for structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map(item => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
};

export default FAQAccordion;
