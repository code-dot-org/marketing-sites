// Verifies key properties of the Logo Transition Modal Contentful component
// definition. The "is registered in code.org only" property is verified by
// inspecting the small diff to `apps/marketing/src/contentful/registration/
// code.org/index.ts` during PR review and by manual Contentful Studio
// verification (T038); importing the full code.org registration list here
// triggers cascading Jest transform errors against ESM-only peer packages
// (react-player, etc.) used by unrelated components.

import {LogoTransitionModalContentfulComponentDefinition} from '@/components/contentful/logoTransitionModal/logoTransitionModalContentfulDefinition';

describe('Logo Transition Modal Contentful component definition', () => {
  it('has the expected id', () => {
    expect(LogoTransitionModalContentfulComponentDefinition.id).toBe(
      'logoTransitionModal',
    );
  });

  it('has the expected display name', () => {
    expect(LogoTransitionModalContentfulComponentDefinition.name).toBe(
      'Logo Transition Modal',
    );
  });

  it('declares zero editor-configurable variables', () => {
    expect(
      Object.keys(
        LogoTransitionModalContentfulComponentDefinition.variables ?? {},
      ),
    ).toHaveLength(0);
  });

  it('declares no built-in style options on the Design tab', () => {
    expect(
      LogoTransitionModalContentfulComponentDefinition.builtInStyles,
    ).toEqual([]);
  });

  it('declares a tooltip with a description', () => {
    expect(
      LogoTransitionModalContentfulComponentDefinition.tooltip?.description,
    ).toEqual(expect.stringContaining('logo-transition'));
  });
});
