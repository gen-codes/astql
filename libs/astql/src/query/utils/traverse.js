const estraverse =require('../../traverse');
import { matches } from './matches';
import { subjects } from './subjects';

/**
* @callback TraverseVisitor
* @param {?external:AST} node
* @param {?external:AST} parent
* @param {external:AST[]} ancestry
*/
/**
 * From a JS AST and a selector AST, collect all JS AST nodes that
 * match the selector.
 * @param {external:AST} ast
 * @param {?SelectorAST} selector
 * @param {TraverseVisitor} visitor
 * @param {ESQueryOptions} [options]
 * @returns {external:AST[]}
 */
export function traverse(ast, selector, visitor, options) {
  if(!selector) {return;}
  const ancestry = [];
  const altSubjects = subjects(selector);
  estraverse.traverse(ast, {
    enter(node, parent) {
      if(parent != null) {ancestry.unshift(parent);}

      if(matches(node, selector, ancestry, options)) {
        if(altSubjects.length) {
          for(let i = 0, l = altSubjects.length; i < l; ++i) {
            if(matches(node, altSubjects[i], ancestry, options)) {
              visitor(node, parent, ancestry);
            }

            for(let k = 0, m = ancestry.length; k < m; ++k) {
              const succeedingAncestry = ancestry.slice(k + 1);
              if(matches(ancestry[k], altSubjects[i], succeedingAncestry, options)) {
                visitor(ancestry[k], parent, succeedingAncestry);
              }
            }
          }
        } else {
          const { selectors } = selector
            .right || selector;
          if(selectors) {
            const hasFields = selectors.findIndex(sel => sel.type === 'field');
            if(hasFields > -1) {
              if(hasFields === selectors.length - 1) {
                const result = selectors[hasFields].name.split('.')
                  .reduce((value, part) => {
                    return value && value[part];
                  }, node);
                visitor(result, parent, ancestry);
              }
            } else {
              visitor(node, parent, ancestry);

            }
          } else {

            visitor(node, parent, ancestry);
          }
        }

      }
    },
    leave() {ancestry.shift();},
    keys: options && options.visitorKeys,
    fallback: options && options.fallback || 'iteration'
  });
}
