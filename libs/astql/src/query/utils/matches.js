import estraverse from '../../traverse';
import { getPath } from './getPath';
import { inPath } from './inPath';
import { LEFT_SIDE, RIGHT_SIDE } from '../index';
import { nthChild } from './nthChild';
import { adjacent } from './adjacent';
import { sibling } from './sibling';

/**
 * @callback TraverseOptionFallback
 * @param {external:AST} node The given node.
 * @returns {string[]} An array of visitor keys for the given node.
 */
/**
 * @typedef {object} ESQueryOptions
 * @property { { [nodeType: string]: string[] } } [visitorKeys] By passing `visitorKeys` mapping, we can extend the properties of the nodes that traverse the node.
 * @property {TraverseOptionFallback} [fallback] By passing `fallback` option, we can control the properties of traversing nodes when encountering unknown nodes.
 */
/**
 * Given a `node` and its ancestors, determine if `node` is matched
 * by `selector`.
 * @param {?external:AST} node
 * @param {?SelectorAST} selector
 * @param {external:AST[]} [ancestry=[]]
 * @param {ESQueryOptions} [options]
 * @throws {Error} Unknowns (operator, class name, selector type, or
 * selector value type)
 * @returns {boolean}
 */
export function matches(node, selector, ancestry, options) {
  if(!selector) {return true;}
  if(!node) {return false;}
  if(!ancestry) {ancestry = [];}

  switch(selector.type) {
    case 'wildcard':
      return true;

    case 'identifier':
      return selector.value.toLowerCase() === node._type.toLowerCase();

    case 'field': {
      const path = selector.name.split('.');
      const ancestor = ancestry[path.length - 1];
      return inPath(node, ancestor, path);

    }
    case 'matches':
      for(const sel of selector.selectors) {
        if(matches(node, sel, ancestry, options)) {return true;}
      }
      return false;

    case 'compound':
      for(const sel of selector.selectors) {
        if(!matches(node, sel, ancestry, options)) {return false;}
      }
      return true;

    case 'not':
      for(const sel of selector.selectors) {
        if(matches(node, sel, ancestry, options)) {return false;}
      }
      return true;

    case 'has': {
      const collector = [];
      for(const sel of selector.selectors) {
        const a = [];
        estraverse.traverse(node, {
          enter(node, parent) {
            if(parent != null) {a.unshift(parent);}
            if(matches(node, sel, a, options)) {
              collector.push(node);
            }
          },
          leave() {a.shift();},
          keys: options && options.visitorKeys,
          fallback: options && options.fallback || 'iteration'
        });
      }
      return collector.length !== 0;

    }
    case 'child':
      if(matches(node, selector.right, ancestry, options)) {
        return matches(ancestry[0], selector.left, ancestry.slice(1), options);
      }
      return false;

    case 'descendant':
      if(matches(node, selector.right, ancestry, options)) {
        for(let i = 0, l = ancestry.length; i < l; ++i) {
          if(matches(ancestry[i], selector.left, ancestry.slice(i + 1), options)) {
            return true;
          }
        }
      }
      return false;

    case 'attribute': {
      const p = getPath(node, selector.name);
      switch(selector.operator) {
        case void 0:
          return p != null;
        case '=':
          switch(selector.value.type) {
            case 'regexp': return typeof p === 'string' && selector.value.value.test(p);
            case 'literal': return `${selector.value.value}` === `${p}`;
            case 'type': return selector.value.value === typeof p;
          }
          throw new Error(`Unknown selector value type: ${selector.value.type}`);
        case '!=':
          switch(selector.value.type) {
            case 'regexp': return !selector.value.value.test(p);
            case 'literal': return `${selector.value.value}` !== `${p}`;
            case 'type': return selector.value.value !== typeof p;
          }
          throw new Error(`Unknown selector value type: ${selector.value.type}`);
        case '<=': return p <= selector.value.value;
        case '<': return p < selector.value.value;
        case '>': return p > selector.value.value;
        case '>=': return p >= selector.value.value;
      }
      throw new Error(`Unknown operator: ${selector.operator}`);
    }
    case 'sibling':
      return matches(node, selector.right, ancestry, options) &&
        sibling(node, selector.left, ancestry, LEFT_SIDE, options) ||
        selector.left.subject &&
        matches(node, selector.left, ancestry, options) &&
        sibling(node, selector.right, ancestry, RIGHT_SIDE, options);
    case 'adjacent':
      return matches(node, selector.right, ancestry, options) &&
        adjacent(node, selector.left, ancestry, LEFT_SIDE, options) ||
        selector.right.subject &&
        matches(node, selector.left, ancestry, options) &&
        adjacent(node, selector.right, ancestry, RIGHT_SIDE, options);

    case 'nth-child':
      return matches(node, selector.right, ancestry, options) &&
        nthChild(node, ancestry, function() {
          return selector.index.value - 1;
        }, options);

    case 'nth-last-child':
      return matches(node, selector.right, ancestry, options) &&
        nthChild(node, ancestry, function(length) {
          return length - selector.index.value;
        }, options);

    case 'class':
      switch(selector.name.toLowerCase()) {
        case 'statement':
          if(node._type.slice(-9) === 'Statement')
            return true;
        // fallthrough: interface Declaration <: Statement { }
        case 'declaration':
          return node._type.slice(-11) === 'Declaration';
        case 'pattern':
          if(node._type.slice(-7) === 'Pattern')
            return true;
        // fallthrough: interface Expression <: Node, Pattern { }
        case 'expression':
          return node._type.slice(-10) === 'Expression' ||
            node._type.slice(-7) === 'Literal' ||
            (
              node._type === 'Identifier' &&
              (ancestry.length === 0 || ancestry[0]._type !== 'MetaProperty')
            ) ||
            node._type === 'MetaProperty';
        case 'function':
          return node._type === 'FunctionDeclaration' ||
            node._type === 'FunctionExpression' ||
            node._type === 'ArrowFunctionExpression';
      }
      throw new Error(`Unknown class name: ${selector.name}`);
  }

  throw new Error(`Unknown selector type: ${selector.type}`);
}
