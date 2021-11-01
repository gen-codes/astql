import defaultParserInterface from '@astql/core/utils/defaultParserInterface';
import pkg from 'remark/package.json';

const ID = 'remark';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage,
  locationProps: new Set(['position']),

  loadParser(callback) {
    multipleRequire(
      [
        'remark',
        'remark-gfm',
        'remark-directive',
        'remark-frontmatter',
        'remark-math',
      ],
      (remark, gfm, directive, frontmatter, math) =>
        callback({ remark, gfm, directive, frontmatter, math })
    );
  },

  parse({ remark, gfm, directive, frontmatter, math }, code, options) {
    const plugins = [
      options['remark-gfm'] ? gfm : false,
      options['remark-directive'] ? directive : false,
      options['remark-frontmatter'] ? [frontmatter, ['yaml', 'toml']] : false,
      options['remark-math'] ? math : false,
    ].filter((plugin) => plugin !== false);
    return remark().use(plugins).parse(code);
  },

  nodeToRange({ position }) {
    if (position) {
      return [position.start.offset, position.end.offset];
    }
  },

  opensByDefault(node, key) {
    return key === 'children';
  },

  getDefaultOptions() {
    return {
      'remark-directive': false,
      'remark-frontmatter': false,
      'remark-gfm': false,
      'remark-math': false,
    };
  },
};
