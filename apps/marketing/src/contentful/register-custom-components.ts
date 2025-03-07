/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import Button, {ButtonContentfulComponentDefinition} from '@/components/button';
import Divider, {
  DividerContentfulComponentDefinition,
} from '@/components/divider';
import FAQAccordion, {
  FAQAccordionContentfulComponentDefinition,
} from '@/components/faqAccordion';
import Heading, {
  HeadingContentfulComponentDefinition,
} from '@/components/heading';
import Link, {LinkContentfulComponentDefinition} from '@/components/link';
import Overline, {
  OverlineContentfulComponentDefinition,
} from '@/components/overline';
import Paragraph, {
  ParagraphContentfulComponentDefinition,
} from '@/components/paragraph';
import Section, {
  SectionContentfulComponentDefinition,
} from '@/components/section';
import Video, {VideoContentfulComponentDefinition} from '@/components/video';

import {
  defineComponents,
  CONTENTFUL_COMPONENTS,
} from '@contentful/experiences-sdk-react';

defineComponents(
  [
    {component: Button, definition: ButtonContentfulComponentDefinition},
    {
      component: Divider,
      definition: DividerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: FAQAccordion,
      definition: FAQAccordionContentfulComponentDefinition,
    },
    {
      component: Heading,
      definition: HeadingContentfulComponentDefinition,
    },
    {
      component: Link,
      definition: LinkContentfulComponentDefinition,
    },
    {component: Overline, definition: OverlineContentfulComponentDefinition},
    {
      component: Paragraph,
      definition: ParagraphContentfulComponentDefinition,
    },
    {
      component: Section,
      definition: SectionContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Video,
      definition: VideoContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
  ],
  {
    enabledBuiltInComponents: [CONTENTFUL_COMPONENTS.image.id],
  },
);
