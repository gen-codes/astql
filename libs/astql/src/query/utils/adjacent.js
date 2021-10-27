import { matches } from './matches';
import { getVisitorKeys } from './getVisitorKeys';
import { isNode } from './isNode';
import { LEFT_SIDE, RIGHT_SIDE } from '../index';

/**
 * Determines if the given node has an adjacent sibling that matches
 * the given selector.
 * @param {external:AST} node
 * @param {SelectorSequenceAST} selector
 * @param {external:AST[]} ancestry
 * @param {Side} side
 * @param {ESQueryOptions|undefined} options
 * @returns {boolean}
 */

export function adjacent(node, selector, ancestry, side, options) {
  const [parent] = ancestry;
  if(!parent) {return false;}
  const keys = getVisitorKeys(parent, options);
  for(const key of keys) {
    const listProp = parent[key];
    if(Array.isArray(listProp)) {
      const idx = listProp.indexOf(node);
      if(idx < 0) {continue;}
      if(side === LEFT_SIDE && idx > 0 && isNode(listProp[idx - 1]) && matches(listProp[idx - 1], selector, ancestry, options)) {
        return true;
      }
      if(side === RIGHT_SIDE && idx < listProp.length - 1 && isNode(listProp[idx + 1]) && matches(listProp[idx + 1], selector, ancestry, options)) {
        return true;
      }
    }
  }
  return false;
}
