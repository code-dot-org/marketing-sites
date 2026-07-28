// Verifies key properties of the GoFundMe Donation Contentful definition.
// "Registered in code.org only" is checked via PR review: importing the full
// code.org registration list here triggers cascading Jest transform errors
// against ESM-only peers (react-player etc.) from unrelated components.

import {GoFundMeDonationContentfulComponentDefinition} from '@/components/contentful/corporateSite/goFundMeDonation/GoFundMeDonationContentfulDefinition';

describe('GoFundMe Donation Contentful component definition', () => {
  it('has the expected id, name, and category', () => {
    expect(GoFundMeDonationContentfulComponentDefinition.id).toBe(
      'goFundMeDonation',
    );
    expect(GoFundMeDonationContentfulComponentDefinition.name).toBe(
      'GoFundMe Donation',
    );
    expect(GoFundMeDonationContentfulComponentDefinition.category).toBe(
      '08: Advanced',
    );
  });

  it('declares no built-in style options on the Design tab', () => {
    expect(GoFundMeDonationContentfulComponentDefinition.builtInStyles).toEqual(
      [],
    );
  });

  // Security-critical: both ids must only be bindable from a GoFundMe Form
  // entry. Re-adding 'manual' would let any editor type arbitrary values.
  it('accepts entry bindings only — no manual values', () => {
    const variables =
      GoFundMeDonationContentfulComponentDefinition.variables ?? {};
    for (const name of ['formDivId', 'formClassyId']) {
      expect(variables[name]?.type).toBe('Text');
      expect(variables[name]?.group).toBe('content');
      expect(variables[name]?.validations?.bindingSourceType).toEqual([
        'entry',
      ]);
    }
  });
});
