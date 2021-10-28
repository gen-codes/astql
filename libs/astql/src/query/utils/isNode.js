/**
 * Check whether the given value is an ASTNode or not.
 * @param {any} node The value to check.
 * @returns {boolean} `true` if the value is an ASTNode.
 */
export function isNode(node) {
  return (
    node !== null && typeof node === 'object' && typeof node._type === 'string'
  );
}
