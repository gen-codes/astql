import { ASTNode, ParserConfig } from '..';
export default function generateASTAndVisitorKeys(
  ast: ASTNode,
  filePath: string,
  text: string,
  config: ParserConfig
): [ASTNode, Record<string, string[]>] {
  const typeKey = Array.from(config.typeProps)[0] || 'type';
  const exclude = Array.from(config._ignoredProperties);
  const forEachProperty = config.forEachProperty.bind(config);
  const getNodeName = config.getNodeName.bind(config);
  const nodeToRange = config.nodeToRange.bind(config);
  if (!ast[typeKey]) {
    ast[typeKey] = '_Fragment';
  }
  const traverse = (
    unparsedNode: ASTNode,
    visitorKeys: any
  ): [ASTNode | ASTNode[], Record<string, any>] => {
    if (Array.isArray(unparsedNode)) {
      const [ast, arrayResult] = unparsedNode.reduce(
        ([nodes, visitorKeys], node) => {
          const [newNode, newVisitorKeys] = traverse(node, visitorKeys);
          nodes.push(newNode);
          return [nodes, newVisitorKeys];
        },
        [[], visitorKeys]
      );
      return [ast, arrayResult];
    }

    const getText = () => {
      const range = nodeToRange(unparsedNode);
      if (!range) {
        return text;
      }
      return text.slice(...range);
    };
    const getFullText = () => {
      return text;
    };
    const getFilePath = () => {
      return filePath;
    };
    const node = {
      getText: getText.bind(unparsedNode),
      getFullText: getFullText.bind(unparsedNode),
      getFilePath: getFilePath.bind(unparsedNode),
    } as ASTNode;
    if (forEachProperty) {
      for (const { key, value } of forEachProperty(unparsedNode)) {
        node[key] = value;
      }
    }
    for (const key in node) {
      if (key === typeKey && typeof node[key] !== 'object') {
        if (getNodeName) {
          const name = getNodeName(node);
          if (name) {
            node._type = name;
          } else {
            node._type = node[key];
          }
        }
        if (!visitorKeys[node._type]) {
          visitorKeys[node._type] = new Set([]);
        }
        Object.keys(node).forEach((key) => {
          !exclude.includes(key) && visitorKeys[node._type].add(key);
        });
      }
      if (node[key] && !exclude.includes(key)) {
        if (typeof node[key] === 'object') {
          const [subnode, subresult] = traverse(node[key], visitorKeys);
          visitorKeys = subresult;
          node[key] = subnode;
        }
      }
    }
    return [node, visitorKeys];
  };
  const [newAst, allVisitorKeysArray] = traverse(ast, {});
  const visitorKeys = Object.keys(allVisitorKeysArray).reduce((acc, key) => {
    acc[key] = Array.from(allVisitorKeysArray[key]);
    return acc;
  }, {});
  if (Array.isArray(newAst)) {
    visitorKeys['_Fragment'] = ['children'];
    return [
      {
        _type: '_Fragment',
        children: newAst,
        getFilePath: () => filePath,
        getText: () => text,
        getFullText: () => text,
      },
      visitorKeys,
    ];
  }
  return [newAst, visitorKeys];
}
