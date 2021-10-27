/**
 * For each selector node marked as a subject, find the portion of the
 * selector that the subject must match.
 * @param {SelectorAST} selector
 * @param {SelectorAST} [ancestor] Defaults to `selector`
 * @returns {SelectorAST[]}
 */
export function subjects(selector: any, ancestor?: any): any[];
