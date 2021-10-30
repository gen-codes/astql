/**
 * Get the value of a property which may be multiple levels down
 * in the object.
 * @returns {undefined|boolean|string|number|external:AST}
 */
export function getPath(obj, key) {
  const keys = key.split('.');
  for (const key of keys) {
    if (obj == null) {
      return obj;
    }
    obj = obj[key];
  }
  return obj;
}
