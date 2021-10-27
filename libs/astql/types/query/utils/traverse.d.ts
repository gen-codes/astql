/**
* @callback TraverseVisitor
* @param {?external:AST} node
* @param {?external:AST} parent
* @param {external:AST[]} ancestry
*/
/**
 * From a JS AST and a selector AST, collect all JS AST nodes that
 * match the selector.
 * @param {external:AST} ast
 * @param {?SelectorAST} selector
 * @param {TraverseVisitor} visitor
 * @param {ESQueryOptions} [options]
 * @returns {external:AST[]}
 */
export function traverse(ast: any, selector: any, visitor: TraverseVisitor, options?: any): External;
export type TraverseVisitor = (: External | null, : External | null, : External) => any;
