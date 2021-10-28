import ParserConfig from "./ParserConfig";
import astquery from "./query";
import generateASTAndVisitorKeys from "./utils/generateVisitorKeys";
import * as languages from './languages';
export interface ASTNode {
  _type: string;
  getText: () => string;
  getFullText: () => string;
  getFilePath: () => string;
  getLeadingComments?: () => string[];
  getTrailingComments?: () => string[];
  replaceWith?: (newNode: ASTNode) => void;
  [key: string]: any;
}
export interface ComplexQueryConfig {
  __anyOf?: ComplexQueryConfig[];
  __allOf?: ComplexQueryConfig[];
  selector?: Selector;
  value?: Selector;
  data?: QuerySchema | QuerySchema[];
  transform?: (values: any, node: ASTNode) => any;
}
export interface ComplexQueryConfigModifier {
  anyOf?: ComplexQueryConfig[];
  allOf?: ComplexQueryConfig[];
}
export type Modifier = 'allOf' | 'anyOf';
export type ComplexQuery = ComplexQueryConfig
//  |  {__anyOf: ComplexQueryConfig[]} | 
//   {__allOf: ComplexQueryConfig[]};
  ;
export type Selector = string
  | ((values: any) => string)
  | [(values: any, node: ASTNode) => any]
  | [string];
export interface QuerySchema {
  [key: string]: ComplexQuery | [ComplexQuery] | Selector;
}
export type Query = string | QuerySchema | [QuerySchema];
export interface CodeInterface {
  loadParserConfig(path, text): ParserConfig | null;
  text: string;
  ast: ASTNode;
  path: string;
  parseOptions: any;
  setText: (text: string) => void;
  getText: () => string;
  dirtyText: boolean;
  config: ParserConfig;
  parse: (options?: any) => Promise<ASTNode >;
  transform?: (query: Query) => ASTNode 
  query: (query: Query) => Promise<ASTNode |
    ASTNode[] |
    string |
    string[]>

}
export const importConfig = (packageName) => {
  return require(packageName).default
}

export class Code implements CodeInterface {
  constructor(
    path: string,
    text: string,
    // query?: Query,
    options?: {
      parser?: ParserConfig | string;
      queryHook?: (selector: string, ast: ASTNode) => (ASTNode | ASTNode[])
    }
  ) {
    this.dirtyText = true;
    this.text = text;
    this.path = path;
    this.queryHook = this.queryHook
    if (options?.parser) {
      if (typeof options.parser === 'string') {
        this.config = importConfig(`@astql/${options.parser}`);
      } else {
        this.config = options.parser;
      }
    } else {
      this.config = this.loadParserConfig(path, text);
    }
  }
  text: string;

  ast: ASTNode;
  path: string;
  config: ParserConfig;
  _parse: any;
  dirtyText: boolean;
  parseOptions: any;
  queryHook: (selector: string, ast: ASTNode) => (ASTNode | ASTNode[])
  loadParserConfig(path, text) {
    const extension = path.split('.').pop();
    if (languages[extension]) {
      const parser = languages[extension].defaultParser ||
        languages[extension]?.detectParser(path, text);
      return importConfig(`@astql/${extension}.${parser}`);
    } else {
      const lang = Object.keys(languages).find(lang => {
        if (
          languages[lang]?.fileExtensions?.includes(extension) ||
          languages[lang]?.fileExtension === extension
        ) {
          return true
        }
        return false
      })
      if(lang){
        const parser = languages[lang].defaultParser ||
          languages[lang]?.decideParser(path, text);
        return importConfig(`@astql/${lang}.${parser}`);
      }else{
        console.error('No parser discovered for ', path)
      }
    }
    return null;
  }
  setText = (text: string) => {
    if (text !== this.text) {
      this.text = text;
      this.dirtyText = true;
    }
  }
  getText =() => {
    return this.text;
  }
  loadParser=()=> {
    if (this._parse) {
      return this._parse;
    }
    return new Promise((resolve) => {
      this.config.loadParser((parser) => {
        this._parse = (code, options) => {
          return this.config.parse(parser, code, options);
        }
        resolve(this._parse);
      });

    })
  }
   parse = async (options?: any) => {
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
      )
      this.config.visitorKeys = newVisitorKeys;
      this.ast = newAst
    }
    return this.ast;
  }
  query = async (selector: Query) => {

    if (this.dirtyText) {
      await this.parse()
    }
    if (typeof (selector) === 'string') {
      return astquery(this.ast, selector, {
        visitorKeys: this.config.visitorKeys,
        hook: this.queryHook
      });
    } else {
      return this.traverseDataSelector(
        selector,
        this.ast,
        this.ast,
      )
    }
  }
  traverseDataSelector =(
    dataSelector: QuerySchema | QuerySchema[],
    ast: ASTNode | ASTNode[],
    root: ASTNode | ASTNode[],
    parentQuery?: string
  ) =>{
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
          transform = objSelector[0].transform

        }
        isArray = true;
      } else if (typeof objSelector === 'object') {
        if(objSelector.__anyOf){
          for(const eachSelector of objSelector.__anyOf){
            const result = this.traverseDataSelector(
              {value: eachSelector},
              ast,
              root,
              // ast?._type
              );
            if(result.value){
              values[key] = result.value
              break;
            }
          }
          transform = objSelector.transform
          if(values[key] && transform){
            values[key] = transform(values[key])
          }
          continue
        }
        if(objSelector.value){
          selector = objSelector.value
          transform = objSelector.transform
        }else{
          isObject = true;
          transform = objSelector.transform
          selector = objSelector.selector;
          data = objSelector.data;
        }
      } else {
        selector = objSelector;
      }
      if (typeof selector === 'function') {
        selector = selector(values);
      }
      let isRootQuery = false;
      if (selector.startsWith('$>')) {
        isRootQuery = true;
        selector = selector.replace(/^(\$>)/, '');
        ast = root;
      }
      if (parentQuery && !isRootQuery) {
        selector = parentQuery + (selector.match(/^[:.>]/) ? selector : ' ' + selector);
      }
      const result = astquery(ast, selector, {
        visitorKeys: this.config.visitorKeys
      });
      if (!isArray && !isObject) {
        if(transform && result[0]){
          values[key] = transform(result[0]);
        }else{
          values[key] = result[0];
        }
        continue;
      }
      if (result.length) {
        if (data) {
          if (isArray) {
            values[key] = result.map(r => {
              return this.traverseDataSelector(
                data,
                r,
                root,
                r._type);
            });
            if(transform && result){
              values[key] = transform(values[key]);
            }
          } else if (isObject) {
            values[key] = this.traverseDataSelector(
              data,
              result[0],
              root,
              result[0]._type
            );
            if(transform && result){
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
  }
}
// // export const simpleQuery: Query = {
// //   name: {
// //     allOf: [{
// //       selector: 'name.value',
// //       data: {
// //         class: 'Identifier',
// //       }
// //     }]
// //   },
// // }
// const queries: Query = {
//   components: [{
//     selector: 'VariableDeclaration:has(QualifiedName>Identifier[escapedText=FC])',
//     data: {
//       name: '>Identifier.escapedText',
//       parameters: [{
//         selector: 'Parameter BindingElement',
//         data: {
//           name: '>Identifier.escapedText'
//         }
//       }],
//       interface: {
//         // allOf: [
//         //   {
//         selector: (values) => `$>InterfaceDeclaration[name.escapedText=${values.name}Props]`,
//         data: {
//           name: '>Identifier.escapedText',
//           properties: [{
//             selector: '>PropertySignature',
//             data: {
//               name: '>Identifier.escapedText',
//               'type': [(values, property) => property.type.getText()]
//             }
//           }]
//         }
//         //   }

//         // ]
//       }
//     }
//   }]
// };
// const code = new Code('something.tsx', 'function(){}', )
// code.query('FunctionDeclaration').then(r=>{
//   console.log(r)
// })