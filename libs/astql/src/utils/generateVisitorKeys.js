export default function generateVisitorKeys(
  ast,
  typeKey,
  exclude,
  getNodeName,
  forEachProperty
) {
  const traverse = (node, result) => {
    if(forEachProperty) {
      for(const { key, value } of forEachProperty(node)) {
        node[key] = value;
      }
    }
    for(const key in node) {
      if(key === typeKey && typeof node[key] !== 'object')  {
        if(getNodeName) {
          const name = getNodeName(node);
          if(name) {
            node._type = name;
          }else{
            node._type = node[key];
          }
        }
        if(!result[node._type]) {
          result[node._type] = new Set([]);
        }
        Object.keys(node).forEach((key) => {
          !exclude.includes(key) && result[node._type].add(key);
        });
      }
      if(node[key] && !exclude.includes(key)) {
        if(typeof node[key] === 'object') {
          result = traverse(node[key], result);
        }
      }
    }
    return result;
  };
  const allVisitorKeys = traverse(ast, {});
  return Object.keys(allVisitorKeys).reduce((acc, key) => {
    acc[key] = Array.from(allVisitorKeys[key]);
    return acc;
  }, {});
}