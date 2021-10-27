/**
 * Determine whether `node` can be reached by following `path`,
 * starting at `ancestor`.
 * @param {?external:AST} node
 * @param {?external:AST} ancestor
 * @param {string[]} path
 * @returns {boolean}
 */
export function inPath(node, ancestor, path) {
  if(path.length === 0) {return node === ancestor;}
  if(ancestor == null) {return false;}

  const field = ancestor[path[0]];

  const remainingPath = path.slice(1);
  if(Array.isArray(field)) {
    for(const component of field) {
      if(inPath(node, component, remainingPath)) {return true;}
    }
    return false;
  } else {
    const result = inPath(node, field, remainingPath);
    if(!result) {
      if(node[path[0]]) {
        return true;
      }
      return false;
    }
  }
}
