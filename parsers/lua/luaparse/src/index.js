import defaultParserInterface from '@astql/core/utils/defaultParserInterface';
import pkg from 'luaparse/package.json';

const ID = 'luaparse';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: `${pkg.version}`,
  homepage: pkg.homepage,
  locationProps: new Set(['range', 'loc']),

  loadParser(callback) {
    new Promise((resolve)=> resolve(['luaparse'].map((mdl)=>require(mdl)))).then( callback);
  },

  parse(luaparse, code, options = {}) {
    return luaparse.parse(code, options);
  },

  getDefaultOptions() {
    return {
      ranges: true,
      locations: false,
      comments: true,
      scope: false,
      luaVersion: '5.1',
    };
  },

  _getSettingsConfiguration() {
    return {
      fields: [
        'ranges',
        'locations',
        'comments',
        'scope',
        ['luaVersion', ['5.1', '5.2', '5.3']],
      ],
      required: new Set(['ranges']),
    };
  },
};
