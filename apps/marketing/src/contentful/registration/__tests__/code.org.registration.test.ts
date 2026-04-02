import CDOContentfulRegistration from '../code.org';

describe('code.org contentful registration', () => {
  it('includes the state gap map registration', () => {
    expect(
      CDOContentfulRegistration.componentRegistrations.some(
        registration =>
          registration.definition.id === 'stateGapMap' &&
          registration.options?.wrapContainerWidth === '100%',
      ),
    ).toBe(true);
  });
});
