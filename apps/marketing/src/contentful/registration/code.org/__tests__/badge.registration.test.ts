// Verifies key properties of the Badge Contentful definition. "Registered in
// code.org only" is checked via PR review: importing the full code.org
// registration list here triggers cascading Jest transform errors against
// ESM-only peers (react-player etc.) from unrelated components.

import {BadgeContentfulComponentDefinition} from '@/components/contentful/badge/BadgeContentfulDefinition';

describe('Badge Contentful component definition', () => {
  it('has the expected id, name, and category', () => {
    expect(BadgeContentfulComponentDefinition.id).toBe('badge');
    expect(BadgeContentfulComponentDefinition.name).toBe('Badge');
    expect(BadgeContentfulComponentDefinition.category).toBe(
      '03: Content Building Blocks',
    );
  });

  it('offers the six fixed badge colors (not the universal swatches)', () => {
    expect(
      BadgeContentfulComponentDefinition.variables?.color?.validations?.in?.map(
        option => option.value,
      ),
    ).toEqual(['black', 'purple', 'blue', 'green', 'orange', 'pink']);
  });

  it('has the expected defaults', () => {
    const variables = BadgeContentfulComponentDefinition.variables ?? {};
    expect(variables.color?.defaultValue).toBe('purple');
    expect(variables.size?.defaultValue).toBe('medium');
    expect(variables.appearance?.defaultValue).toBe('auto');
    expect(variables.iconPosition?.defaultValue).toBe('left');
    expect(variables.isIconOnly?.defaultValue).toBe(false);
    expect(variables.text?.defaultValue).toBe('Badge');
  });

  it('places text, icon name, and aria label in the content tab', () => {
    const variables = BadgeContentfulComponentDefinition.variables ?? {};
    for (const name of ['text', 'iconName', 'ariaLabel']) {
      expect(variables[name]?.group).toBe('content');
    }
    for (const name of [
      'color',
      'size',
      'appearance',
      'iconPosition',
      'isIconOnly',
    ]) {
      expect(variables[name]?.group).toBe('style');
    }
  });

  it('declares no built-in style options on the Design tab', () => {
    expect(BadgeContentfulComponentDefinition.builtInStyles).toEqual([]);
  });
});
