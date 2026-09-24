import {Breakpoint} from '@contentful/experiences-core/types';

// Studio breakpoints, aligned with MUI's sm=600 / md=900 so Contentful layouts
// and MUI-styled components switch at the same widths.
export const hourOfAiBreakpoints: Breakpoint[] = [
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
