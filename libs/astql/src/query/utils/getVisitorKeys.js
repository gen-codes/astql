import estraverse from '../../traverse';

/**
 * Get visitor keys of a given node.
 * @returns {string[]} Visitor keys of the node.
 */
export function getVisitorKeys(node, options) {
  const nodeType = node._type;

  if (options && options.visitorKeys && options.visitorKeys[nodeType]) {
    return options.visitorKeys[nodeType];
  }

  if (estraverse.VisitorKeys[nodeType]) {
    return estraverse.VisitorKeys[nodeType];
  }
  if (options && typeof options.fallback === 'function') {
    return options.fallback(node);
  }
  // 'iteration' fallback
  return Object.keys(node).filter(function (key) {
    return key !== 'type';
  });
}
