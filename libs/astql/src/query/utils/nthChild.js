import { getVisitorKeys } from './getVisitorKeys';
/**
 * Determines if the given node is the nth child, determined by
 * `idxFn`, which is given the containing list's length.
 * @returns {boolean}
 */

export function nthChild(node, ancestry, idxFn, options) {
  const [parent] = ancestry;
  if (!parent) {
    return false;
  }
  const keys = getVisitorKeys(parent, options);
  for (const key of keys) {
    const listProp = parent[key];
    if (Array.isArray(listProp)) {
      const idx = listProp.indexOf(node);
      if (idx >= 0 && idx === idxFn(listProp.length)) {
        return true;
      }
    }
  }
  return false;
}
