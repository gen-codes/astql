/* vim: set sw=4 sts=4 : */
import { match } from './utils/match';
import { matches } from './utils/matches';
import { parse } from './utils/parse';
import { traverse } from './utils/traverse';

export interface ASTNode {
  _type: string;
  _text: string;
  getText: () => string;
  getFullText: () => string;
  getFilePath: () => string;
  getLeadingComments?: () => string[];
  getTrailingComments?: () => string[];
  replaceWith?: (newNode: ASTNode) => void;
  [key: string]: unknown;
}
/**
 * @typedef {"LEFT_SIDE"|"RIGHT_SIDE"} Side
 */

export const LEFT_SIDE = 'LEFT_SIDE';
export const RIGHT_SIDE = 'RIGHT_SIDE';

/**
 * Query the code AST using the selector string.
 */
async function query(
  ast: ASTNode,
  selector: string,
  options: {
    preHook?: (
      selector: string,
      ast: ASTNode | ASTNode[]
    ) => Promise<ASTNode | false>;
    postHook?: (selector: string, result: unknown) => Promise<unknown>;
    visitorKeys?: Record<string, string[]>;
  }
): Promise<ASTNode[] | ASTNode> {
  if (options.preHook) {
    const result = await options.preHook(selector, ast);
    if (result) {
      ast = result;
    }
  }
  const parsedSelector = parse(
    selector
      .replace(/\n/g, '')
      .replace(/[\s]*:/, ':')
      .replace(/[\s]*\./, '.')
  );
  let result: ASTNode[] = [];
  try {
    result = match(ast, parsedSelector, options);
  } catch (err) {
    console.log('Error with selector', selector, err);
  }
  if (options.postHook) {
    result = (await options.postHook(selector, result)) as ASTNode[];
  }
  return result;
}

export { parse, match, traverse, matches, query };
export default query;
