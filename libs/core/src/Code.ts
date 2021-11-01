import ParserConfig from './ParserConfig';
import astquery from '@astql/query';
import generateASTAndVisitorKeys from './utils/generateVisitorKeys';
import * as languages from '@astql/languages';
export interface ASTNode {
  _type: string;
  getText: () => string;
  getFullText: () => string;
  getFilePath: () => string;
  getLeadingComments?: () => string[];
  getTrailingComments?: () => string[];
  querySelector?: (selector: SimpleSelector) => ASTNode;
  querySelectorAll?: (selector: SimpleSelector) => ASTNode[];
  replaceWith?: (newNode: ASTNode) => void;
  [key: string]: any;
}
export type CodeMod = (node: ASTNode, values: Record<string, any>) => void;
export type ComplexSelector =
  | {
      selector: SimpleSelector;
      data: DataSelector | DataSelector[];
      transform?: (values: any, node: ASTNode) => any;
      codemod?: CodeMod;
    }
  | {
      $allOf?: ComplexSelector[];
      $anyOf?: ComplexSelector[];
    }
  | {
      value: SimpleSelector;
      transform?: (values: any, node: ASTNode) => any;
      codemod?: CodeMod;
    };
export interface IComplexSelector {
  __anyOf?: IComplexSelector[];
  __allOf?: IComplexSelector[];
  selector?: SimpleSelector;
  value?: SimpleSelector;
  data?: DataSelector | DataSelector[];
  transform?: (values: any, node: ASTNode) => any;
}

export type SimpleSelector =
  | string
  | ((values: any) => string)
  | [(values: any, node: ASTNode) => any]
  | [string];
export interface DataSelector {
  [key: string]: ComplexSelector | [ComplexSelector] | SimpleSelector;
}
export type Selector = string | DataSelector | [DataSelector];
export interface CodeInterface {
  autoDiscoverParserConfig(path, text): Promise<ParserConfig | null>;
  text: string;
  ast: ASTNode;
  path: string;
  parserInput?: string | ParserConfig;
  parseOptions: any;
  setText: (text: string) => void;
  getText: () => string;
  dirtyText: boolean;
  config: ParserConfig;
  parse: (options?: any) => Promise<ASTNode>;
  transform?: (query: Selector) => ASTNode;
  query: (query: Selector) => Promise<ASTNode | ASTNode[] | string | string[]>;
}
export const importConfig = async (
  packageName: string
): Promise<ParserConfig> => {
  return (await import(packageName)).default;
};

export class Code implements CodeInterface {
  constructor(
    path: string,
    text: string,
    // query?: Query,
    options?: {
      parser?: ParserConfig | string;
      queryPreHook?: (selector: string) => Promise<ASTNode | false>;
      queryPostHook?: (selector: string, result: any) => Promise<any>;
    }
  ) {
    this.dirtyText = true;
    this.text = text;
    this.path = path;
    this.queryPreHook = options?.queryPreHook;
    this.queryPostHook = options?.queryPostHook;
    this.parserInput = options?.parser;
  }

  text: string;
  parserInput?: string | ParserConfig;

  ast: ASTNode;
  path: string;
  config: ParserConfig;
  _parse: any;
  dirtyText: boolean;
  parseOptions: any;
  queryPreHook?: (selector: string, ast: ASTNode) => Promise<ASTNode | false>;
  queryPostHook?: (selector: string, result: any) => Promise<any>;
  loadParserConfig = async (): Promise<void> => {
    if (!this.config) {
      if (this.parserInput) {
        if (typeof this.parserInput === 'string') {
          this.config = await importConfig(`@astql/${this.parserInput}`);
        } else {
          this.config = this.parserInput;
        }
      } else {
        const config = await this.autoDiscoverParserConfig(
          this.path,
          this.text
        );
        if (config) {
          this.config = config;
        }
      }
    }
  };
  autoDiscoverParserConfig = async (path, text) => {
    const extension = path.split('.').pop();
    if (languages[extension]) {
      const parser =
        languages[extension].defaultParser ||
        languages[extension]?.detectParser(path, text);
      return importConfig(`@astql/${extension}.${parser}`);
    } else {
      const lang = Object.keys(languages).find((lang) => {
        if (
          languages[lang]?.fileExtensions?.includes(extension) ||
          languages[lang]?.fileExtension === extension
        ) {
          return true;
        }
        return false;
      });
      if (lang) {
        const parser =
          languages[lang].defaultParser ||
          languages[lang]?.decideParser(path, text);
        return importConfig(`@astql/${lang}.${parser}`);
      } else {
        console.error('No parser discovered for ', path);
      }
    }
    return null;
  };
  setText = (text: string) => {
    if (text !== this.text) {
      this.text = text;
      this.dirtyText = true;
    }
  };
  getText = () => {
    return this.text;
  };
  loadParser = () => {
    if (this._parse) {
      return this._parse;
    }
    return new Promise((resolve) => {
      this.config.loadParser((parser) => {
        this._parse = (code, options) => {
          return this.config.parse(parser, code, options);
        };
        resolve(this._parse);
      });
    });
  };
  parse = async (options?: any) => {
    await this.loadParserConfig();
    this.parseOptions = options || this.config.getDefaultOptions();
    if (this.dirtyText) {
      const loadedParse = await this.loadParser();
      this.ast = loadedParse(this.text, this.parseOptions);
      this.dirtyText = false;

      const [newAst, newVisitorKeys] = generateASTAndVisitorKeys(
        this.ast,
        this.path,
        this.text,
        this.config
      );
      newAst.visitorKeys = newVisitorKeys;
      this.config.visitorKeys = { hello: [], ...newVisitorKeys };
      this.ast = newAst;
    }
    return this.ast;
  };
  query = async (selector: Selector): Promise<any> => {
    if (this.dirtyText) {
      await this.parse();
    }
    // console.log(this.ast)
    if (typeof selector === 'string') {
      return await astquery(this.ast, selector, {
        visitorKeys: this.config.visitorKeys,
        preHook: this.queryPreHook,
        postHook: this.queryPostHook,
      });
    } else {
      return this.traverseDataSelector(selector, this.ast, this.ast);
    }
  };
  traverseDataSelector = async (
    dataSelector: DataSelector | [DataSelector],
    ast: ASTNode,
    root: ASTNode,
    parentQuery?: string
  ): Promise<ASTNode> => {
    const values = {} as any;
    for (const key in dataSelector) {
      const objSelector = dataSelector[key];
      let isArray = false;
      let isObject = false;
      let selector;
      let data;
      let transform;
      if (Array.isArray(objSelector)) {
        if (typeof objSelector[0] === 'function') {
          values[key] = objSelector[0](ast, values);
          continue;
        } else if (typeof objSelector[0] === 'string') {
          selector = objSelector[0];
        } else {
          selector = objSelector[0].selector;
          data = objSelector[0].data;
          transform = objSelector[0].transform;
        }
        isArray = true;
      } else if (typeof objSelector === 'object') {
        if (objSelector.$anyOf) {
          for (const eachSelector of objSelector.$anyOf) {
            const result = await this.traverseDataSelector(
              { value: eachSelector },
              ast,
              root
            );
            if (result.value) {
              values[key] = result.value;
              break;
            }
          }
          transform = objSelector.transform;
          if (values[key] && transform) {
            values[key] = transform(values[key]);
          }
          continue;
        }
        if (objSelector.value) {
          selector = objSelector.value;
          transform = objSelector.transform;
        } else {
          isObject = true;
          transform = objSelector.transform;
          selector = objSelector.selector;
          data = objSelector.data;
        }
      } else {
        selector = objSelector;
      }
      if (typeof selector === 'function') {
        selector = selector(values);
      }
      if (Array.isArray(selector)) {
        isArray = true;
        selector = selector[0];
      }
      if (typeof selector !== 'string') {
        console.log(selector, typeof selector);
        throw new Error('Selector is ' + selector);
      }
      let isRootQuery = false;
      if (selector.startsWith('$>')) {
        isRootQuery = true;
        selector = selector.replace(/^(\$>)/, '');
        ast = root;
      }
      if (parentQuery && !isRootQuery) {
        selector =
          parentQuery + (selector.match(/^[:.>]/) ? selector : ' ' + selector);
      }
      const result: ASTNode[] | ASTNode = await astquery(ast, selector, {
        visitorKeys: this.config.visitorKeys,
        preHook: this.queryPreHook,
        postHook: this.queryPostHook,
      });
      if (!isArray && !isObject) {
        if (transform && result[0]) {
          values[key] = transform(result[0]);
        } else {
          values[key] = result[0];
        }
        continue;
      }
      if (result.length) {
        if (data) {
          if (isArray) {
            values[key] = (await Promise.all(
              result.map(
                async (r): Promise<ASTNode> => {
                  return await this.traverseDataSelector(
                    data,
                    r,
                    root,
                    r._type
                  );
                }
              )
            )) as ASTNode[];
            if (transform && result) {
              values[key] = transform(values[key]);
            }
          } else if (isObject) {
            values[key] = await this.traverseDataSelector(
              data,
              result[0],
              root,
              result[0]._type
            );
            if (transform && result) {
              values[key] = transform(values[key]);
            }
          }
        } else {
          if (isArray) {
            values[key] = result;
          } else {
            values[key] = result[0];
          }
        }
      }
    }
    return values;
  };
}
export default Code;
