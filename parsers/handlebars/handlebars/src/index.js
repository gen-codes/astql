import defaultParserInterface from '@astql/languages/handlebars/utils/defaultHandlebarsParserInterface';
import pkg from 'handlebars/package.json';

const ID = 'handlebars';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage,

  loadParser(callback) {
    new Promise((resolve)=> resolve(['handlebars'].map((mdl)=>require(mdl)))).then( (handlebars) => callback(handlebars.parse));
  },

  opensByDefault(node, key) {
    return key === 'body';
  },
};
