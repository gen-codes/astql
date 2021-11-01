import defaultParserInterface from '@astql/core/utils/defaultParserInterface';
import pkg from 'sqlite-parser/package.json';

const ID = 'sqlite-parser';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage || 'https://github.com/codeschool/sqlite-parser',

  loadParser(callback) {
    new Promise((resolve)=> resolve(['sqlite-parser'].map((mdl)=>require(mdl)))).then( callback);
  },

  parse(sqliteParser, code) {
    return sqliteParser(code);
  },

  opensByDefault(node, key) {
    return key === 'statement';
  },
};
