import { multipleRequire } from '@astql/core';
import defaultParserInterface from '@astql/core/utils/defaultParserInterface';
import pkg from 'svelte/package.json';

const ID = 'svelte';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage,
  locationProps: new Set(['start', 'end']),
  typeProps: new Set(['tag']),

  loadParser(callback) {
    multipleRequire(['svelte/compiler'], callback);
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
      preserveWhitespace: true,
      preserveComments: true,
    };
  },
  _ignoredProperties: new Set(['parent']),
};
