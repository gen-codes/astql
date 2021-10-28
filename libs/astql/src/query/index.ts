/* vim: set sw=4 sts=4 : */
import { ASTNode } from '../CodeParser';
import { match } from './utils/match';
import { matches } from './utils/matches';
import { parse } from './utils/parse';
import { traverse } from './utils/traverse';

/**
 * @typedef {"LEFT_SIDE"|"RIGHT_SIDE"} Side
 */

export const LEFT_SIDE = 'LEFT_SIDE';
export const RIGHT_SIDE = 'RIGHT_SIDE';

/**
 * Query the code AST using the selector string.
 */
function query(ast: ASTNode | ASTNode[], selector: string, options): ASTNode[] {
  if (options.hook) {
    const result = options.hook(selector, ast);
    if (result) {
      return result;
    }
  }
  return match(
    ast,
    parse(
      selector
        .replace(/\n/g, '')
        .replace(/[\s]*:/, ':')
        .replace(/[\s]*\./, '.')
    ),
    options
  );
}

query.parse = parse;
query.match = match;
query.traverse = traverse;
query.matches = matches;
query.query = query;

export default query;
