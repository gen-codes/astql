import defaultParserInterface from 'astql/utils/defaultParserInterface';
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
    require('astql/utils/multiple-require')(['redot'], callback);
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
