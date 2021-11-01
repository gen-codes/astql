import defaultParserInterface from '@astql/core/utils/defaultParserInterface';
import pkg from 'java-parser/package.json';

const ID = 'java-parser';

export const parserSettingsConfiguration = {
  fields: [],
};

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage:
    pkg.homepage ||
    'https://github.com/jhipster/prettier-java/tree/master/packages/java-parser',

  locationProps: new Set(['location']),
  typeProps: new Set(['name']),

  loadParser(callback) {
    new Promise((resolve)=> resolve(['java-parser'].map((mdl)=>require(mdl)))).then( callback);
  },

  parse(parser, code) {
    return parser.parse(code);
  },

  _ignoredProperties: new Set(['tokenType']),

  getDefaultOptions() {
    return {};
  },

  getNodeName({ name }) {
    return name;
  },

  nodeToRange({ location }) {
    if (!location) {
      return;
    }
    return [location.startOffset, location.endOffset + 1];
  },
};
