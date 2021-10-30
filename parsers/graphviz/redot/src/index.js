import { multipleRequire } from '@astql/core';
import defaultParserInterface from '@astql/core/utils/defaultParserInterface';
import pkg from 'redot/package.json';

const ID = 'redot';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage,
  locationProps: new Set(['position']),

  loadParser(callback) {
    multipleRequire(['redot'], callback);
  },

  parse(redot, code) {
    return redot().parse(code);
  },

  nodeToRange({ position }) {
    if (position) {
      return [position.start.offset, position.end.offset];
    }
  },

  opensByDefault(node, key) {
    return key === 'children';
  },
};
