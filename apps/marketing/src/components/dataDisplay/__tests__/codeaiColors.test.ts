import {readFileSync} from 'node:fs';
import path from 'node:path';

import {CODEAI, codeaiVar} from '../codeaiColors';

const scss = readFileSync(
  path.resolve(
    __dirname,
    '../../../../../../packages/component-library-styles/primitiveColors.scss',
  ),
  'utf8',
);

describe('CODEAI', () => {
  it.each(
    Object.entries(CODEAI).filter(
      ([name]) => name !== 'white' && name !== 'black',
    ),
  )('%s matches its --codeai-* token', (name, hex) => {
    const variable = codeaiVar(name as keyof typeof CODEAI).match(
      /var\((--codeai-[a-z0-9-]+),/,
    )![1];
    const token = scss.match(new RegExp(`${variable}:\\s*(#[0-9a-fA-F]{6})`));
    expect(token?.[1].toUpperCase()).toBe(hex);
  });
});
