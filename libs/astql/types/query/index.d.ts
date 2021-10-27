/**
* @typedef {"LEFT_SIDE"|"RIGHT_SIDE"} Side
*/
export const LEFT_SIDE: "LEFT_SIDE";
export const RIGHT_SIDE: "RIGHT_SIDE";
export default query;
export type Side = "LEFT_SIDE" | "RIGHT_SIDE";
/**
 * Query the code AST using the selector string.
 * @param {external:AST} ast
 * @param {string} selector
 * @param {ESQueryOptions} [options]
 * @returns {external:AST[]}
 */
declare function query(ast: any, selector: string, options?: any): External;
declare namespace query {
    export { parse };
    export { match };
    export { traverse };
    export { matches };
    export { query };
}
import { parse } from "./utils/parse";
import { match } from "./utils/match";
import { traverse } from "./utils/traverse";
import { matches } from "./utils/matches";
