import defaultParserInterface from '@astql/core/utils/defaultParserInterface';
import pkg from 'pbkit/package.json';

const ID = 'pbkit';

export default {
  ...defaultParserInterface,
  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: 'https://github.com/riiid/pbkit',
  locationProps: new Set(['start', 'end']),
  typeProps: new Set(['type']),

  loadParser(callback) {
    new Promise((resolve)=> resolve(['pbkit/core/parser/proto'].map((mdl)=>require(mdl)))).then( callback);
  },

  parse(parser, code) {
    return parser.parse(code).ast;
  },

  nodeToRange(node) {
    const { start, end } = node;
    return [start, end];
  },

  opensByDefault(node, key) {
    if (key === 'statements') {
      return true;
    }
  },
};
