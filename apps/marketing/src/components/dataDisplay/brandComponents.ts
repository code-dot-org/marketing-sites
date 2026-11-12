'use client';

// Our Contentful building blocks read the MUI theme and the Section
// background context, so server components reach them through this client
// boundary. They still render on the server.
// Button is Code.org's Studio Button (the brand button styles).
export {default as Button} from '@/components/contentful/corporateSite/buttonLegacy';
export {default as CustomText} from '@/components/contentful/customText';
export {default as Divider} from '@/components/contentful/divider/Divider';
export {default as Heading} from '@/components/contentful/heading';
export {default as Link} from '@/components/contentful/link/Link';
export {default as Paragraph} from '@/components/contentful/paragraph';
export {default as Section} from '@/components/contentful/section';
