import defaultParserInterface from '@astql/languages/handlebars/utils/defaultHandlebarsParserInterface';
import pkg from '@glimmer/syntax/package.json';

const ID = 'glimmer';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage || 'https://github.com/glimmerjs/glimmer-vm',

  loadParser(callback) {
    new Promise((resolve)=> resolve(['@glimmer/syntax'].map((mdl)=>require(mdl)))).then( (glimmer) =>
      callback(glimmer.preprocess)
    );
  },

  opensByDefault(node, key) {
    return key === 'body';
  },
};
