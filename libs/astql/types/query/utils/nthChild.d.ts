/**
* @callback IndexFunction
* @param {Integer} len Containing list's length
* @returns {Integer}
*/
/**
 * Determines if the given node is the nth child, determined by
 * `idxFn`, which is given the containing list's length.
 * @param {external:AST} node
 * @param {external:AST[]} ancestry
 * @param {IndexFunction} idxFn
 * @param {ESQueryOptions|undefined} options
 * @returns {boolean}
 */
export function nthChild(node: any, ancestry: any, idxFn: IndexFunction, options: any | undefined): boolean;
export type IndexFunction = (len: any) => any;
