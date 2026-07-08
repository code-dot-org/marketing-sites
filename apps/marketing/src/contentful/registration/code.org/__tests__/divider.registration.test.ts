// Verifies the code.org Divider definition variant. "Registered in code.org
// only" is checked via PR review: importing the full code.org registration
// list here triggers cascading Jest transform errors against ESM-only peers
// (react-player etc.) from unrelated components.

import {
  CodeOrgDividerContentfulComponentDefinition,
  DividerContentfulComponentDefinition,
} from '@/components/contentful/divider/dividerContentfulDefinition';

describe('code.org Divider Contentful component definition', () => {
  it('keeps the shared id and name', () => {
    expect(CodeOrgDividerContentfulComponentDefinition.id).toBe('divider');
    expect(CodeOrgDividerContentfulComponentDefinition.name).toBe('Divider');
  });

  it('defaults the color to Gray 5', () => {
    const {color} = CodeOrgDividerContentfulComponentDefinition.variables;
    expect(color.defaultValue).toBe('gray5');
    expect(color.validations?.in).toEqual(
      expect.arrayContaining([
        {value: 'gray5', displayName: 'Gray 5 (default)'},
        {value: 'strong', displayName: 'Secondary (legacy)'},
      ]),
    );
  });

  it('offers direction and width style options with safe defaults', () => {
    const {direction, width} =
      CodeOrgDividerContentfulComponentDefinition.variables;
    expect(direction.group).toBe('style');
    expect(direction.defaultValue).toBe('horizontal');
    expect(direction.validations?.in?.map(option => option.value)).toEqual([
      'horizontal',
      'vertical',
    ]);
    expect(width.group).toBe('style');
    expect(width.defaultValue).toBe('small');
    expect(width.validations?.in?.map(option => option.value)).toEqual([
      'small',
      'medium',
    ]);
  });

  it('leaves the base (csforall) definition without the new options', () => {
    const variables = DividerContentfulComponentDefinition.variables;
    expect(variables.color.defaultValue).toBe('purplePrimary');
    expect(variables.direction).toBeUndefined();
    expect(variables.width).toBeUndefined();
  });
});
