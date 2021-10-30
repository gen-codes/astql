import { multipleRequire } from '@astql/core';
import pkg from 'solidity-parser-diligence/package.json';
import defaultParserInterface from '@astql/core/utils/defaultParserInterface';

const ID = 'solidity-parser-diligence';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage:
    pkg.homepage || 'https://github.com/consensys/solidity-parser-antlr',

  loadParser(callback) {
    multipleRequire(['solidity-parser-diligence'], callback);
  },

  parse(parser, code, options) {
    return parser.parse(code, options);
  },

  opensByDefault(node, key) {
    return (
      node.type === 'SourceUnit' ||
      node.type === 'ContractDefinition' ||
      key === 'children' ||
      key === 'subNodes' ||
      key === 'body'
    );
  },

  getDefaultOptions() {
    return {
      range: true,
      loc: false,
      tolerant: false,
    };
  },

  _getSettingsConfiguration() {
    return {
      fields: ['range', 'loc', 'tolerant'],
    };
  },
};
