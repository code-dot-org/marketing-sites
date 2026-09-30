import {AutoDownloadContentfulComponentDefinition as definition} from '../AutoDownloadContentfulDefinition';

// The id is stored in Experience component trees; renaming it orphans placed
// instances.
describe('AutoDownloadContentfulComponentDefinition', () => {
  it('keeps the stored component id', () => {
    expect(definition.id).toBe('autoDownload');
  });

  it('is listed under Advanced in Studio', () => {
    expect(definition.category).toBe('08: Advanced');
  });

  it('binds the file to an asset', () => {
    expect(definition.variables.file).toMatchObject({
      type: 'Media',
      validations: {bindingSourceType: ['asset']},
    });
  });

  it('exposes localizable copy with the documented defaults', () => {
    expect(definition.variables.message).toMatchObject({
      type: 'Text',
      defaultValue: 'Your download should start automatically.',
    });
    expect(definition.variables.linkText).toMatchObject({
      type: 'Text',
      defaultValue: "If it doesn't, download the file here.",
    });
    expect(definition.variables.failMessage).toMatchObject({
      type: 'Text',
      defaultValue: "The download didn't start automatically.",
    });
  });
});
