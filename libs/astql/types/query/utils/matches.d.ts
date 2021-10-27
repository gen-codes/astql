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
export function matches(node: any, selector: any, ancestry: any, options?: ESQueryOptions): boolean;
export type TraverseOptionFallback = (: External) => string[];
export type ESQueryOptions = {
    /**
     * By passing `visitorKeys` mapping, we can extend the properties of the nodes that traverse the node.
     */
    visitorKeys?: {
        [nodeType: string]: string[];
    };
    /**
     * By passing `fallback` option, we can control the properties of traversing nodes when encountering unknown nodes.
     */
    fallback?: TraverseOptionFallback;
};
