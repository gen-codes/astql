const parser = require('@astql/parser');
/**
 * Parse a selector string and return its AST.
 * @param {string} selector
 * @returns {SelectorAST}
 */
export function parse(selector) {
  return parser.parse(selector);
}
