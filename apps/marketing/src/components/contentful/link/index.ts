// Export the Component Definitions for use in Contentful Studio.
// Both definitions share id `link` but expose different Design-tab variable
// enums per tenant — see specs/008-brand-buttons/research.md R13.
export {
  LinkContentfulComponentDefinition,
  BrandLinkContentfulComponentDefinition,
  LegacyLinkContentfulComponentDefinition,
} from './LinkContentfulDefinition';
export type {LinkProps} from './Link';
export {default} from './Link';
export {default as BrandLinkAdapter} from './BrandLinkAdapter';
