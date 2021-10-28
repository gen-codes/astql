
import {Code} from 'astql';
import fs from 'fs';
import path from 'path';
import codeExample from './codeExample.js';

const code = new Code('file.thrift', codeExample, {
  parser: require('../index.js').default,
});
it('code should parse without error', async () => {
  await code.parse()
  expect(code.ast).toHaveProperty('_type');
});
it('ast.getFullText() should match codeExample.txt', async () => {
  expect(code.ast.getFullText()).toMatchSnapshot();
});
it('should query generated ast', async () => {
  const result = await code.query('*')
  expect(result.length).not.toBe(0);
  expect(result.length).toMatchSnapshot();
});
