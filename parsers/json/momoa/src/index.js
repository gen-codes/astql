import defaultParserInterface from '@astql/core/utils/defaultParserInterface';
import pkg from '@humanwhocodes/momoa/package.json';

const ID = 'momoa';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage,
  locationProps: new Set(['loc']),

  loadParser(callback) {
    new Promise((resolve)=> resolve(['@humanwhocodes/momoa'].map((mdl)=>require(mdl)))).then( callback);
  },

  parse(momoa, code, options) {
    return momoa.parse(code, options);
  },

  nodeToRange({ loc }) {
    if (loc) {
      return [loc.start.offset, loc.end.offset];
    }
  },

  getDefaultOptions() {
    return {
      comments: true,
      tokens: true,
      ranges: true,
    };
  },
};
