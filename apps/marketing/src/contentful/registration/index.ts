/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import {
  defineBreakpoints,
  defineComponents,
  defineDesignTokens,
} from '@contentful/experiences-sdk-react';

import {Brand} from '@/config/brand';

import CDOContentfulRegistration from './code.org';
import CSForAllContentfulRegistration from './csforall';

function getContentfulRegistration(brand: Brand) {
  switch (brand) {
    case Brand.CODE_DOT_ORG:
      return CDOContentfulRegistration;
    case Brand.CS_FOR_ALL:
      return CSForAllContentfulRegistration;
  }
}

export function registerContentfulComponents(brand: Brand) {
  const registration = getContentfulRegistration(brand);

  if (registration) {
    if ('designTokens' in registration && registration.designTokens) {
      defineDesignTokens(registration.designTokens);
    }
    if ('breakpoints' in registration && registration.breakpoints) {
      defineBreakpoints(registration.breakpoints);
    }
    defineComponents(registration.componentRegistrations, registration.options);
  }
}
