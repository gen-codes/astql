import { matches } from './matches';
import { getVisitorKeys } from './getVisitorKeys';
import { isNode } from './isNode';
import { LEFT_SIDE } from '../index';

/**
 * Determines if the given node has a sibling that matches the
 * given selector.
 * @param {external:AST} node
 * @param {SelectorSequenceAST} selector
 * @param {external:AST[]} ancestry
 * @param {Side} side
 * @param {ESQueryOptions|undefined} options
 * @returns {boolean}
 */

export function sibling(node, selector, ancestry, side, options) {
  const [parent] = ancestry;
  if(!parent) {return false;}
  const keys = getVisitorKeys(parent, options);
  for(const key of keys) {
    const listProp = parent[key];
    if(Array.isArray(listProp)) {
      const startIndex = listProp.indexOf(node);
      if(startIndex < 0) {continue;}
      let lowerBound, upperBound;
      if(side === LEFT_SIDE) {
        lowerBound = 0;
        upperBound = startIndex;
      } else {
        lowerBound = startIndex + 1;
        upperBound = listProp.length;
      }
      for(let k = lowerBound; k < upperBound; ++k) {
        if(isNode(listProp[k]) && matches(listProp[k], selector, ancestry, options)) {
          return true;
        }
      }
    }
  }
  return false;
}
