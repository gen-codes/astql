import { ASTNode } from '../index';
import { traverse } from './traverse';

/**
 * From a JS AST and a selector AST, collect all JS AST nodes that
 * match the selector.
 */
export function match(ast: ASTNode, selector: any, options: any): ASTNode[] {
  const results: ASTNode[] = [];
  let field;
  traverse(
    ast,
    selector,
    function (node) {
      if (field) {
        const v = field.split('.').reduce((value, part) => {
          return value && value[part];
        }, node);
        results.push(v);
      } else {
        results.push(node);
      }
    },
    options
  );
  return results;
}
