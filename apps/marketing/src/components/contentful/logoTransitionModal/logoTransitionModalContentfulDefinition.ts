// Contentful Studio definition for the Logo Transition Modal. No
// editor-configurable variables -- placement on an Experience is the only
// configuration. The animation (CSS-animated SVG) and header SVG are bundled in
// the component, so editorial changes can't break the hand-off. No picker
// thumbnail/tooltip image (matching the State Gap Map component).
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const LogoTransitionModalContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'logoTransitionModal',
    name: 'Logo Transition Modal',
    category: '08: Advanced',
    tooltip: {
      description:
        'One-shot logo-transition overlay. Plays an animated logo transition on page load, then hands off to the new header logo. No fields to configure — placement is the only configuration.',
    },
    // No default style options on the Design tab.
    builtInStyles: [],
    // No editor-configurable variables.
    variables: {},
  };
