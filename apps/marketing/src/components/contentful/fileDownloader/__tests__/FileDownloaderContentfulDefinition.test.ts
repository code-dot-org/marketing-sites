import {FileDownloaderContentfulComponentDefinition as definition} from '../FileDownloaderContentfulDefinition';

// The id is stored in Experience component trees; renaming it orphans placed
// instances.
describe('FileDownloaderContentfulComponentDefinition', () => {
  it('keeps the stored component id', () => {
    expect(definition.id).toBe('fileDownloader');
  });

  it('binds files to an entry array', () => {
    expect(definition.variables.files).toMatchObject({
      type: 'Array',
      group: 'content',
      validations: {required: true, bindingSourceType: ['entry']},
    });
  });

  it('offers a placeholder with a default', () => {
    expect(definition.variables.placeholder).toMatchObject({
      type: 'Text',
      group: 'content',
      defaultValue: 'Select a file',
    });
  });

  it('offers seven colors and three styles on the Design tab', () => {
    const {color, variant} = definition.variables;
    const values = (options?: {value: unknown}[]) =>
      (options ?? []).map(({value}) => value);

    expect(color).toMatchObject({group: 'style', defaultValue: 'purple'});
    expect(values(color.validations?.in)).toEqual([
      'black',
      'white',
      'purple',
      'blue',
      'green',
      'orange',
      'pink',
    ]);
    expect(variant).toMatchObject({group: 'style', defaultValue: 'dark'});
    expect(values(variant.validations?.in)).toEqual([
      'light',
      'dark',
      'secondary',
    ]);
  });
});
