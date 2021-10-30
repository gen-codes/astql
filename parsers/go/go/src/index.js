import { multipleRequire } from '@astql/core';
import defaultParserInterface from '@astql/core/utils/defaultParserInterface';

const ID = 'go';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: '1.13.4',
  homepage: 'https://golang.org/pkg/go/',
  _ignoredProperties: new Set(['_type']),
  locationProps: new Set(['Loc']),

  async loadParser(callback) {
    multipleRequire(['astexplorer-go'], async (parser) => {
      await parser.init();
      callback(parser);
    });
  },

  parse(parser, code) {
    return parser.parseFile(code);
  },

  getNodeName(node) {
    return node._type;
  },

  nodeToRange(node) {
    if (node.Loc) {
      return [node.Loc.Start, node.Loc.End].map(({ Offset }) => Offset);
    }
  },
};
