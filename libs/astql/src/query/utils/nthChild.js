import {getVisitorKeys} from './getVisitorKeys';

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

export function nthChild(node, ancestry, idxFn, options) {
  const [parent] = ancestry;
  if(!parent) {return false;}
  const keys = getVisitorKeys(parent, options);
  for(const key of keys) {
    const listProp = parent[key];
    if(Array.isArray(listProp)) {
      const idx = listProp.indexOf(node);
      if(idx >= 0 && idx === idxFn(listProp.length)) {return true;}
    }
  }
  return false;
}
