// Creates a definition for the Logo Transition Modal component to be used
// in Contentful Studio. The module has NO editor-configurable variables -- its
// presence on an Experience is the only configuration. The destination SVG is
// bundled with the application (apps/marketing/public/images/) and the
// logo-transition WEBM is served from a fixed Contentful CDN URL baked into the
// component, so the seamless video -> SVG hand-off cannot be broken by
// editorial asset changes.
//
// Phase 0 MCP-confirmation items (see specs/005-logo-transition-modal/
// research.md and contracts/LogoTransitionModal.contentful-contract.md):
//   1. `variables: {}` is accepted by `defineComponents` at runtime.
//   2. No paired Contentful entry content-type is required.
//   3. The `category` string below is in line with existing definitions.
//
// All three items must be verified against the Code.org Contentful space via
// Contentful MCP before this registration is shipped to production. The
// `thumbnailUrl` and `tooltip.imageUrl` placeholders MUST be replaced with
// the real Contentful CDN URLs after editorial uploads the assets (T035-T036).
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const LogoTransitionModalContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'logoTransitionModal',
    name: 'Logo Transition Modal',
    category: '03: Content Building Blocks',
    // TODO(editorial): replace with the real Contentful-hosted thumbnail asset
    // URL once editorial uploads it. See tasks T006 (request), T035 (upload),
    // and T036 (re-read + wire URL).
    thumbnailUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/PLACEHOLDER-thumbnail/logo-transition-modal-thumbnail.png',
    tooltip: {
      description:
        'One-shot logo-transition overlay. Plays an animated logo transition on page load, then hands off to the new header logo. No fields to configure — placement is the only configuration.',
      // TODO(editorial): replace with the real Contentful-hosted tooltip asset
      // URL once editorial uploads it.
      imageUrl:
        'https://contentful-images.code.org/90t6bu6vlf76/PLACEHOLDER-tooltip/logo-transition-modal-tooltip.png',
    },
    // No default style options on the Design tab.
    builtInStyles: [],
    // No editor-configurable variables.
    variables: {},
  };
