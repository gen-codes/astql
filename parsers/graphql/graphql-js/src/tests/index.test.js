
import {Code} from 'astql';
import fs from 'fs';
import path from 'path';
import codeExample from './codeExample.js';

const code = new Code('file.graphql', codeExample, {
  parser: require('../index.js').default,
});
// it('code should parse without error', async () => {
//   expect(code.ast).toHaveProperty('_type');
// });
it('ast.getText() should match codeExample.txt', async () => {
  await code.parse()
  expect(code.ast.getFullText()).toMatchSnapshot();
});
it('should query generated ast', async () => {
  const result = await code.query('*')
  expect(result.length).toMatchSnapshot();
});
