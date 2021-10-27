/**
 * For each selector node marked as a subject, find the portion of the
 * selector that the subject must match.
 * @param {SelectorAST} selector
 * @param {SelectorAST} [ancestor] Defaults to `selector`
 * @returns {SelectorAST[]}
 */
export function subjects(selector, ancestor) {
  if(selector == null || typeof selector != 'object') {return [];}
  if(ancestor == null) {ancestor = selector;}
  const results = selector.subject ? [ancestor] : [];
  for(const [p, sel] of Object.entries(selector)) {
    results.push(...subjects(sel, p === 'left' ? sel : ancestor));
  }
  return results;
}
