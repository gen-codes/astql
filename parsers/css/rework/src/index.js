import defaultParserInterface from '@astql/languages/css/utils/defaultCSSParserInterface';
import pkg from 'css/package.json';

const ID = 'rework';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage || 'https://github.com/reworkcss/rework',
  locationProps: new Set(['position']),

  loadParser(callback) {
    new Promise((resolve)=> resolve(['css/lib/parse'].map((mdl)=>require(mdl)))).then( callback);
  },

  nodeToRange({ position: range }) {
    if (!range) return;
    return [range.start, range.end].map((pos) => this.getOffset(pos));
  },

  opensByDefault(node, key) {
    return key === 'rules';
  },

  _ignoredProperties: new Set(['parsingErrors', 'source', 'content']),
};
