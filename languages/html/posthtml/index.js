import defaultParserInterface from 'astql/utils/defaultParserInterface';
import pkg from 'posthtml-parser/package.json';

const ID = 'posthtml-parser';
const name = 'posthtml-parser';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: name,
  version: pkg.version,
  homepage: pkg.homepage || 'https://github.com/fb55/htmlparser2',

  loadParser(callback) {
    require('astql/utils/multiple-require')(['posthtml-parser'], callback);
  },

  parse(posthtmlParser, code, options) {
    return posthtmlParser(code, options);
  },

  opensByDefault(node, key) {
    return key === 'content';
  },

  getDefaultOptions() {
    return { lowerCaseTags: false, lowerCaseAttributeNames: false };
  },

  typeProps: new Set(['tag']),
};
