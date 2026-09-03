import {
  Columns,
  ContentfulContainer,
  SingleColumn,
  columnsDefinition,
  containerDefinition,
  sectionDefinition,
  singleColumnDefinition,
} from '@contentful/experiences-components-react';
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import ButtonMui, {
  ButtonMuiContentfulComponentDefinition,
} from '@/components/contentful/button';
import Card, {
  CardContentfulComponentDefinition,
} from '@/components/contentful/card';
import CardCollection, {
  CardCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/cardCollection';
import LogoCollection, {
  LogoCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/logoCollection';
import PeopleCollection, {
  PeopleCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/peopleCollection';
import TextCollection, {
  TextCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/textCollection';
import CustomText, {
  CustomTextContentfulComponentDefinition,
} from '@/components/contentful/customText';
import Divider, {
  CodeOrgDividerContentfulComponentDefinition,
} from '@/components/contentful/divider';
import FAQAccordion, {
  FAQAccordionContentfulComponentDefinition,
} from '@/components/contentful/faqAccordion';
import Heading, {
  HeadingContentfulComponentDefinition,
} from '@/components/contentful/heading';
import Iframe, {
  IframeContentfulComponentDefinition,
} from '@/components/contentful/iframe';
import Image, {
  ImageCorporateSiteContentfulComponentDefinition,
} from '@/components/contentful/image';
import Link, {
  BrandLinkContentfulComponentDefinition,
} from '@/components/contentful/link';
import Overline, {
  OverlineContentfulComponentDefinition,
} from '@/components/contentful/overline';
import Paragraph, {
  ParagraphContentfulComponentDefinition,
} from '@/components/contentful/paragraph';
import RichText, {
  RichTextContentfulComponentDefinition,
} from '@/components/contentful/richText';
import Section, {
  SectionCorporateSiteContentfulComponentDefinition,
} from '@/components/contentful/section';
import Spacer, {
  SpacerContentfulComponentDefinition,
} from '@/components/contentful/spacer';
import Testimonial, {
  TestimonialContentfulComponentDefinition,
} from '@/components/contentful/testimonial';
import Video, {
  VideoContentfulComponentDefinition,
} from '@/components/contentful/video';
import {SECTION_MAX_WIDTH} from '@/themes/hourofai/constants/layout';

// Native structure components, re-registered so they carry our categories and
// container defaults. Mirrors the Code.org setup: the SDK React components and
// full variable schemas are untouched, so only the defaults for new instances
// change. Requires __unsafe__enableBuiltInStructureOverwrites below.
const containerDefinitionWithOverrides: ComponentDefinition = {
  ...containerDefinition,
  category: '02: Page Structure',
  variables: {
    ...containerDefinition.variables,
    cfMaxWidth: {
      ...containerDefinition.variables.cfMaxWidth,
      type: 'Text',
      defaultValue: SECTION_MAX_WIDTH,
    },
    cfGap: {
      ...containerDefinition.variables.cfGap,
      type: 'Text',
      // row gap, column gap
      defaultValue: '0rem 2rem',
    },
    // The SDK's axis naming is swapped from the Studio UI: this is the control
    // Studio surfaces as horizontal "Align left".
    cfVerticalAlignment: {
      ...containerDefinition.variables.cfVerticalAlignment,
      type: 'Text',
      defaultValue: 'start', // Left
    },
  },
};

const sectionDefinitionWithOverrides: ComponentDefinition = {
  ...sectionDefinition,
  category: '08: Advanced',
};

const columnsDefinitionWithOverrides: ComponentDefinition = {
  ...columnsDefinition,
  category: '08: Advanced',
};

const singleColumnDefinitionWithOverrides: ComponentDefinition = {
  ...singleColumnDefinition,
  category: '08: Advanced',
};

/**
 * Hour of AI Contentful Studio registration.
 *
 * Deliberately a curated starter set rather than a copy of the Code.org
 * registry. Excluded on purpose: unit cards and carousels, the course catalog,
 * catalog interstitials, curriculum/lab snapshots, hero banners, action blocks,
 * badges, editorial cards, tab groups, skinny banners and everything under
 * `contentful/corporateSite/` (adoption map, AFE eligibility, donation blocks,
 * state gap map, your-school). Add components here as the site needs them —
 * a component that is not registered for this brand renders NOTHING on it.
 *
 * The native structure components (Container, Section, Columns, SingleColumn)
 * are registered to match Code.org's authoring experience.
 */
const contentfulRegistration = {
  componentRegistrations: [
    {
      component: ButtonMui,
      definition: ButtonMuiContentfulComponentDefinition,
    },
    {
      component: Card,
      definition: CardContentfulComponentDefinition,
    },
    {
      component: CardCollection,
      definition: CardCollectionContentfulComponentDefinition,
    },
    {
      component: CustomText,
      definition: CustomTextContentfulComponentDefinition,
    },
    {
      component: Divider,
      definition: CodeOrgDividerContentfulComponentDefinition,
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
      component: Iframe,
      definition: IframeContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Image,
      definition: ImageCorporateSiteContentfulComponentDefinition,
    },
    {
      component: Link,
      definition: BrandLinkContentfulComponentDefinition,
    },
    {
      component: LogoCollection,
      definition: LogoCollectionContentfulComponentDefinition,
    },
    {
      component: Overline,
      definition: OverlineContentfulComponentDefinition,
    },
    {
      component: Paragraph,
      definition: ParagraphContentfulComponentDefinition,
    },
    {
      component: PeopleCollection,
      definition: PeopleCollectionContentfulComponentDefinition,
    },
    {
      component: RichText,
      definition: RichTextContentfulComponentDefinition,
    },
    {
      component: Section,
      definition: SectionCorporateSiteContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Spacer,
      definition: SpacerContentfulComponentDefinition,
    },
    {
      component: TextCollection,
      definition: TextCollectionContentfulComponentDefinition,
    },
    {
      component: Testimonial,
      definition: TestimonialContentfulComponentDefinition,
    },
    {
      component: Video,
      definition: VideoContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: ContentfulContainer,
      definition: containerDefinitionWithOverrides,
      options: {
        enableEditorProperties: {
          isEditorMode: true,
          isEmpty: true,
          nodeBlockId: true,
        },
      },
    },
    // The SDK reuses ContentfulContainer for sections, branching internally on
    // nodeBlockId.
    {
      component: ContentfulContainer,
      definition: sectionDefinitionWithOverrides,
      options: {
        enableEditorProperties: {
          isEditorMode: true,
          isEmpty: true,
          nodeBlockId: true,
        },
      },
    },
    {
      component: Columns,
      definition: columnsDefinitionWithOverrides,
    },
    // The child cell rendered inside Columns. Registered so the editor can
    // render column children.
    {
      component: SingleColumn,
      definition: singleColumnDefinitionWithOverrides,
      options: {
        enableEditorProperties: {
          isEditorMode: true,
          isEmpty: true,
        },
      },
    },
  ],
  options: {
    enabledBuiltInComponents: [],
    // Required to re-register the reserved structure component ids above.
    __unsafe__enableBuiltInStructureOverwrites: true,
  },
};

export default contentfulRegistration;
