// Contentful Studio definition for the Logo Transition Modal. No
// editor-configurable variables -- placement on an Experience is the only
// configuration. Assets are baked into the component (bundled SVG + fixed
// Contentful CDN URL), so editorial changes can't break the hand-off.
//
// The thumbnailUrl and tooltip.imageUrl placeholders MUST be replaced with real
// Contentful CDN URLs after editorial uploads the assets (T035-T036).
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const LogoTransitionModalContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'logoTransitionModal',
    name: 'Logo Transition Modal',
    category: '03: Content Building Blocks',
    // TODO(editorial): replace with real Contentful thumbnail URL once uploaded
    // (tasks T006/T035/T036).
    thumbnailUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/PLACEHOLDER-thumbnail/logo-transition-modal-thumbnail.png',
    tooltip: {
      description:
        'One-shot logo-transition overlay. Plays an animated logo transition on page load, then hands off to the new header logo. No fields to configure — placement is the only configuration.',
      // TODO(editorial): replace with real Contentful tooltip URL once uploaded.
      imageUrl:
        'https://contentful-images.code.org/90t6bu6vlf76/PLACEHOLDER-tooltip/logo-transition-modal-tooltip.png',
    },
    // No default style options on the Design tab.
    builtInStyles: [],
    // No editor-configurable variables.
    variables: {},
  };
