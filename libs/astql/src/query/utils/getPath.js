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
export function getPath(obj, key) {
  const keys = key.split('.');
  for(const key of keys) {
    if(obj == null) {return obj;}
    obj = obj[key];
  }
  return obj;
}
