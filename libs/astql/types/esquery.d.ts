export default query;
/**
 * One of the rules of `grammar.pegjs`
 */
export type SelectorAST = any;
/**
 * The `sequence` production of `grammar.pegjs`
 */
export type SelectorSequenceAST = any;
export type TraverseOptionFallback = (: External) => string[];
export type ESQueryOptions = {
    /**
     * : string[] }  [visitorKeys] By passing `visitorKeys` mapping, we can extend the properties of the nodes that traverse the node.
     */
    "": [nodeType: string];
    /**
     * By passing `fallback` option, we can control the properties of traversing nodes when encountering unknown nodes.
     */
    fallback?: TraverseOptionFallback;
};
export type IndexFunction = (len: any) => any;
export type TraverseVisitor = (: External | null, : External | null, : External) => any;
export type Side = "LEFT_SIDE" | "RIGHT_SIDE";
/**
 * Query the code AST using the selector string.
 * @param {external:AST} ast
 * @param {string} selector
 * @param {ESQueryOptions} [options]
 * @returns {external:AST[]}
 */
declare function query(ast: any, selector: string, options?: ESQueryOptions): External;
declare namespace query {
    export { parse };
    export { match };
    export { traverse };
    export { matches };
    export { query };
}
/**
 * Parse a selector string and return its AST.
 * @param {string} selector
 * @returns {SelectorAST}
 */
declare function parse(selector: string): any;
/**
 * From a JS AST and a selector AST, collect all JS AST nodes that
 * match the selector.
 * @param {external:AST} ast
 * @param {?SelectorAST} selector
 * @param {ESQueryOptions} [options]
 * @returns {external:AST[]}
 */
declare function match(ast: any, selector: any, options?: ESQueryOptions): External;
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
declare function traverse(ast: any, selector: any, visitor: TraverseVisitor, options?: ESQueryOptions): External;
/**
 * @callback TraverseOptionFallback
 * @param {external:AST} node The given node.
 * @returns {string[]} An array of visitor keys for the given node.
 */
/**
 * @typedef {object} ESQueryOptions
 * @property { [nodeType: string]: string[] }  [visitorKeys] By passing `visitorKeys` mapping, we can extend the properties of the nodes that traverse the node.
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
declare function matches(node: any, selector: any, ancestry: any, options?: ESQueryOptions): boolean;
