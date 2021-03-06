import { multipleRequire } from '@astql/core';
import defaultParserInterface from '@astql/core/utils/defaultParserInterface';
import pkg from 'graphql/package.json';

const ID = 'graphql-js';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage,
  locationProps: new Set(['loc']),
  typeProps: new Set(['kind']),
  _ignoredProperties: new Set(['parent', 'next', 'prev']),

  loadParser(callback) {
    multipleRequire(['graphql/language'], ({ parse }) => {
      callback({ parse });
    });
  },

  parse({ parse }, code, options) {
    return parse(code, options);
  },

  nodeToRange(node) {
    if (node.loc) {
      return [node.loc.start, node.loc.end];
    }
  },

  getNodeName(node) {
    return node.kind;
  },

  opensByDefault(node, key) {
    return key === 'definitions';
  },

  getDefaultOptions() {
    return {
      noLocation: false,
      noSource: false,
    };
  },
};
