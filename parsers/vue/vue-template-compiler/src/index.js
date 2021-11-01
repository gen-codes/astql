import defaultParserInterface from '@astql/core/utils/defaultParserInterface';
import pkg from 'vue-template-compiler/package.json';

const ID = 'vue-template-compiler';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage,
  locationProps: new Set(['start', 'end']),
  typeProps: new Set(['tag']),

  loadParser(callback) {
    new Promise((resolve)=> resolve(['vue-template-compiler/browser'].map((mdl)=>require(mdl)))).then( callback);
  },

  parse(parser, code, options) {
    return parser.compile(code, options).ast;
  },

  nodeToRange(node) {
    if (node.type || node.name) {
      return [node.start, node.end];
    }
  },

  opensByDefault(node, key) {
    return key === 'children';
  },

  getNodeName(node) {
    return node.tag;
  },

  getDefaultOptions() {
    return {
      outputSourceRange: true,
      whitespace: 'preserve',
    };
  },
  _ignoredProperties: new Set(['parent']),
};
