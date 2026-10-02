import {
  BrandVideoContentfulComponentDefinition,
  VideoContentfulComponentDefinition,
} from '../videoContentfulDefinition';

describe('Video definitions', () => {
  it('adds a Design-tab download toggle, on by default, for the brand video', () => {
    expect(
      BrandVideoContentfulComponentDefinition.variables.showDownload,
    ).toMatchObject({type: 'Boolean', group: 'style', defaultValue: true});
  });

  it('leaves the csforall definition without it', () => {
    expect(
      VideoContentfulComponentDefinition.variables.showDownload,
    ).toBeUndefined();
  });
});
