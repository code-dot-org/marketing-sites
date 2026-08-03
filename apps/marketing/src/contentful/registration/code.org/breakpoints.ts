import {Breakpoint} from '@contentful/experiences-core/types';

// Breakpoints registered with Contentful Studio. Aligned with the MUI theme's
// default breakpoints (sm=600, md=900) so Contentful content and MUI-styled
// chrome switch layouts at the same widths. IDs are unchanged
// (desktop/tablet/mobile) — only the query thresholds move — so design values
// already authored per breakpoint stay valid. `previewSize` is only the Studio
// preview-canvas width and is left as-is.
export const codeOrgBreakpoints: Breakpoint[] = [
  {
    id: 'desktop',
    query: '*',
    displayName: 'All Sizes',
    previewSize: '100%',
    displayIcon: 'desktop',
  },
  {
    id: 'tablet',
    query: '<900px',
    displayName: 'Tablet',
    previewSize: '820px',
    displayIcon: 'tablet',
  },
  {
    id: 'mobile',
    query: '<600px',
    displayName: 'Mobile',
    previewSize: '390px',
    displayIcon: 'mobile',
  },
];
