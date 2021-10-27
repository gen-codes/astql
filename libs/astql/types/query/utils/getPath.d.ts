/**
 * @external AST
 * @see https://esprima.readthedocs.io/en/latest/syntax-tree-format.html
 */
/**
 * One of the rules of `grammar.pegjs`
 * @typedef {PlainObject} SelectorAST
 * @see grammar.pegjs
*/
/**
 * The `sequence` production of `grammar.pegjs`
 * @typedef {PlainObject} SelectorSequenceAST
*/
/**
 * Get the value of a property which may be multiple levels down
 * in the object.
 * @param {?PlainObject} obj
 * @param {string} key
 * @returns {undefined|boolean|string|number|external:AST}
 */
export function getPath(obj: any, key: string): undefined | boolean | string | number | External;
/**
 * One of the rules of `grammar.pegjs`
 */
export type SelectorAST = any;
/**
 * The `sequence` production of `grammar.pegjs`
 */
export type SelectorSequenceAST = any;
