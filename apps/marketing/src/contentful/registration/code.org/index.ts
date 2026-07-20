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

import ActionBlock, {
  ActionBlockContentfulComponentDefinition,
} from '@/components/contentful/actionBlocks/defaultActionBlock';
import FullWidthActionBlock, {
  FullWidthActionBlockContentfulComponentDefinition,
} from '@/components/contentful/actionBlocks/fullWidthActionBlock';
import Badge, {
  BadgeContentfulComponentDefinition,
} from '@/components/contentful/badge';
import CardCarousel, {
  CardCarouselContentfulComponentDefinition,
} from '@/components/contentful/cardCarousel';
import ActionBlockCarousel, {
  ActionBlockCarouselContentfulComponentDefinition,
} from '@/components/contentful/carousels/actionBlockCarousel';
import ImageCarousel, {
  ImageCarouselContentfulComponentDefinition,
} from '@/components/contentful/carousels/imageCarousel';
import VideoCarousel, {
  VideoCarouselContentfulComponentDefinition,
} from '@/components/contentful/carousels/videoCarousel';
import CatalogInterstitial, {
  CatalogInterstitialContentfulComponentDefinition,
} from '@/components/contentful/catalogInterstitial';
import ActionBlockCollection, {
  ActionBlockCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/actionBlockCollection';
import LogoCollection, {
  LogoCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/logoCollection';
import PeopleCollection, {
  PeopleCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/peopleCollection';
import ContentCard, {
  ContentCardContentfulComponentDefinition,
} from '@/components/contentful/contentCard';
import AdoptionMap, {
  AdoptionMapContentfulComponentDefinition,
} from '@/components/contentful/corporateSite/adoptionMap';
import AFEEligibility, {
  AFEEligibilityContentfulComponentDefinition,
} from '@/components/contentful/corporateSite/afeEligibility';
import Button, {
  ButtonLegacyContentfulComponentDefinition,
} from '@/components/contentful/corporateSite/buttonLegacy';
import {DoubleTheDonationContentfulComponentDefinition} from '@/components/contentful/corporateSite/doubleTheDonation';
import DoubleTheDonation from '@/components/contentful/corporateSite/doubleTheDonation/DoubleTheDonation';
import StateGapMap, {
  StateGapMapContentfulComponentDefinition,
} from '@/components/contentful/corporateSite/stateGapMap';
import YourSchool, {
  YourSchoolContentfulComponentDefinition,
} from '@/components/contentful/corporateSite/yourSchool';
import CourseCatalog, {
  CourseCatalogContentfulComponentDefinition,
} from '@/components/contentful/courseCatalog';
import CustomText, {
  CustomTextContentfulComponentDefinition,
} from '@/components/contentful/customText';
import Divider, {
  CodeOrgDividerContentfulComponentDefinition,
} from '@/components/contentful/divider';
import EditorialCard, {
  EditorialCardContentfulComponentDefinition,
} from '@/components/contentful/editorialCard';
import FAQAccordion, {
  FAQAccordionContentfulComponentDefinition,
} from '@/components/contentful/faqAccordion';
import Heading, {
  HeadingContentfulComponentDefinition,
} from '@/components/contentful/heading';
import HeroBanner, {
  HeroBannerContentfulComponentDefinition,
} from '@/components/contentful/heroBanner';
import Icon, {
  IconContentfulComponentDefinition,
} from '@/components/contentful/icon';
import IconHighlight, {
  IconHighlightContentfulComponentDefinition,
} from '@/components/contentful/iconHighlight';
import Iframe, {
  IframeContentfulComponentDefinition,
} from '@/components/contentful/iframe';
import Image, {
  ImageCorporateSiteContentfulComponentDefinition,
} from '@/components/contentful/image';
import Link, {
  BrandLinkContentfulComponentDefinition,
} from '@/components/contentful/link';
import LogoTransitionModal, {
  LogoTransitionModalContentfulComponentDefinition,
} from '@/components/contentful/logoTransitionModal';
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
import SimpleList, {
  SimpleListContentfulComponentDefinition,
} from '@/components/contentful/simpleList';
import SkinnyBanner, {
  SkinnyBannerContentfulComponentDefinition,
} from '@/components/contentful/skinnyBanner';
import CurriculumSnapshot, {
  CurriculumSnapshotContentfulComponentDefinition,
} from '@/components/contentful/snapshots/curriculumSnapshot';
import LabSnapshot, {
  LabSnapshotContentfulComponentDefinition,
} from '@/components/contentful/snapshots/labSnapshot';
import Spacer, {
  SpacerContentfulComponentDefinition,
} from '@/components/contentful/spacer';
import TabGroup, {
  TabGroupContentfulComponentDefinition,
} from '@/components/contentful/tabGroup';
import Testimonial, {
  TestimonialContentfulComponentDefinition,
} from '@/components/contentful/testimonial';
import UnitCard, {
  UnitCardContentfulComponentDefinition,
} from '@/components/contentful/unitCard';
import UnitCarousel, {
  UnitCarouselContentfulComponentDefinition,
} from '@/components/contentful/unitCarousel';
import Video, {
  VideoContentfulComponentDefinition,
} from '@/components/contentful/video';
import {SECTION_MAX_WIDTH} from '@/themes/code.org/constants';

import {codeOrgBreakpoints} from './breakpoints';
import {codeOrgDesignTokens} from './designTokens';

// Re-categorize the three native structure components into our numbered
// sidebar groups, and patch Container's defaults (cfMaxWidth, cfGap). The
// SDK React components and full variable schemas are untouched — existing
// pages keep rendering and new instances pick up the new defaults. Requires
// __unsafe__enableBuiltInStructureOverwrites on the registration options
// (set below).
//
// Note: arbitrary CSS variables (e.g. zIndex) added to these overrides are
// NOT honored — the SDK's buildCfStyles() only maps a fixed allowlist of
// cf* props to CSS, and ContentfulContainer's extractRenderProps() filters
// out anything else before render. To add new CSS-tied controls to a
// native, you'd have to wrap or replace the SDK component.
const containerDefinitionWithOverrides: ComponentDefinition = {
  ...containerDefinition,
  category: '02: Page Structure',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/6WfOhpSXpSnPCTIGOrqXjz/2a5470ea723c740420ff75c00542f775/component_container_thumbnail.png',
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
    // Note the SDK's axis naming is swapped from the Studio UI: this is the
    // control Studio surfaces as horizontal "Align left".
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

const contentfulRegistration = {
  componentRegistrations: [
    {
      component: ActionBlock,
      definition: ActionBlockContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: ActionBlockCarousel,
      definition: ActionBlockCarouselContentfulComponentDefinition,
    },
    {
      component: AdoptionMap,
      definition: AdoptionMapContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: AFEEligibility,
      definition: AFEEligibilityContentfulComponentDefinition,
    },
    // '03: Content Building Blocks' components, in palette display order.
    {
      component: Heading,
      definition: HeadingContentfulComponentDefinition,
    },
    {
      component: Paragraph,
      definition: ParagraphContentfulComponentDefinition,
    },
    {
      component: CustomText,
      definition: CustomTextContentfulComponentDefinition,
    },
    {
      component: RichText,
      definition: RichTextContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Button,
      definition: ButtonLegacyContentfulComponentDefinition,
    },
    {
      component: Link,
      definition: BrandLinkContentfulComponentDefinition,
    },
    {
      component: Badge,
      definition: BadgeContentfulComponentDefinition,
    },
    {
      component: Icon,
      definition: IconContentfulComponentDefinition,
    },
    {
      component: SimpleList,
      definition: SimpleListContentfulComponentDefinition,
    },
    {
      component: Image,
      definition: ImageCorporateSiteContentfulComponentDefinition,
    },
    {
      component: Video,
      definition: VideoContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: ActionBlockCollection,
      definition: ActionBlockCollectionContentfulComponentDefinition,
    },
    {
      component: LogoCollection,
      definition: LogoCollectionContentfulComponentDefinition,
    },
    {
      component: PeopleCollection,
      definition: PeopleCollectionContentfulComponentDefinition,
    },
    {
      component: ContentCard,
      definition: ContentCardContentfulComponentDefinition,
    },
    {
      component: CardCarousel,
      definition: CardCarouselContentfulComponentDefinition,
      options: {
        // The container centers items instead of stretching them, so the
        // SDK wrapper otherwise shrink-wraps to the slide row's intrinsic
        // width and overflows once slides outgrow the container.
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Divider,
      definition: CodeOrgDividerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: DoubleTheDonation,
      definition: DoubleTheDonationContentfulComponentDefinition,
    },
    {
      component: StateGapMap,
      definition: StateGapMapContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },

    {
      component: EditorialCard,
      definition: EditorialCardContentfulComponentDefinition,
    },
    {
      component: FAQAccordion,
      definition: FAQAccordionContentfulComponentDefinition,
    },
    {
      component: FullWidthActionBlock,
      definition: FullWidthActionBlockContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: HeroBanner,
      definition: HeroBannerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: IconHighlight,
      definition: IconHighlightContentfulComponentDefinition,
    },
    {
      component: Iframe,
      definition: IframeContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: ImageCarousel,
      definition: ImageCarouselContentfulComponentDefinition,
    },
    {
      component: LabSnapshot,
      definition: LabSnapshotContentfulComponentDefinition,
    },
    {
      component: LogoTransitionModal,
      definition: LogoTransitionModalContentfulComponentDefinition,
    },
    {component: Overline, definition: OverlineContentfulComponentDefinition},
    {
      component: Section,
      definition: SectionCorporateSiteContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: SkinnyBanner,
      definition: SkinnyBannerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Spacer,
      definition: SpacerContentfulComponentDefinition,
    },
    {
      component: CurriculumSnapshot,
      definition: CurriculumSnapshotContentfulComponentDefinition,
    },
    {component: TabGroup, definition: TabGroupContentfulComponentDefinition},
    {
      component: Testimonial,
      definition: TestimonialContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    // Curriculum category components, in palette display order.
    {
      component: UnitCard,
      definition: UnitCardContentfulComponentDefinition,
    },
    {
      component: UnitCarousel,
      definition: UnitCarouselContentfulComponentDefinition,
    },
    {
      component: CourseCatalog,
      definition: CourseCatalogContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
        enableEditorProperties: {
          isEditorMode: true,
        },
      },
    },
    {
      component: CatalogInterstitial,
      definition: CatalogInterstitialContentfulComponentDefinition,
      options: {
        enableEditorProperties: {
          isEditorMode: true,
        },
      },
    },
    {
      component: VideoCarousel,
      definition: VideoCarouselContentfulComponentDefinition,
    },
    {
      component: YourSchool,
      definition: YourSchoolContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    // Native Container re-categorized into '02: Page Structure' and given
    // patched cfMaxWidth/cfGap defaults. The component and full variable
    // schema are untouched.
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
    // Native Section and Columns surfaced under '08: Advanced' so power users
    // can reach them without crowding the main palette. The SDK reuses
    // ContentfulContainer for sections, branching internally on nodeBlockId.
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
    // SingleColumn is the child cell rendered inside Columns. Registered so
    // the editor can render column children; re-categorized off the native
    // 'contentful-component' bucket so the "Structure" sidebar group can
    // potentially collapse to empty.
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
    // Required to re-register the reserved `contentful-container` id. We only
    // patch defaults — the native React component is reused. Safe on
    // @contentful/experiences-sdk-react@^3.8.8.
    __unsafe__enableBuiltInStructureOverwrites: true,
  },
  designTokens: codeOrgDesignTokens,
  breakpoints: codeOrgBreakpoints,
};

export default contentfulRegistration;
