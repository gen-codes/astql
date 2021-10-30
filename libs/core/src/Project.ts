import {
  ASTNode,
  Code,
  defaultParserInterface,
  ParserConfig,
  Selector,
} from './';
import { matches, parse } from '@astql/query';

export type ProjectConfigFiles = {
  cwd?: string;
  filesTree?: Record<string, string>;
  selector?: Selector;
  parsers?: {
    [regexOrGlob: string]: ParserConfig | string;
  };
  files?: string | string[];
  readFile?: (path: string) => string;
  writeFile?: (path: string, content: string) => void;
};

export type ProjectConfigOptional = {
  cwd?: string;
  filesTree?: Record<string, string>;
  selector?: Selector;
  parsers?: {
    [regexOrGlob: string]: ParserConfig | string;
  };
};

export type ProjectConfig = ProjectConfigFiles;
export interface ProjectInterface {
  readFile: (path: string) => string;
}
/**
 * Project class to handle ast parsing and quering in
 * multiple files using the `Code` class
 *
 * @examples Initialization
 * # With glob files query and custom readFile function
 * This can run only on node.
 * new Project({
 *   files: '*.ts',
 *   readFile: (f) => require('fs').readFileSync(f, 'utf8')
 * })
 * # With a list of files to read from the filesystem
 * new Project({
 *   files: ['path.ts'],
 * })
 * # With a filesTree object
 * new Project({
 *   filesTree: {
 *     'path': 'content'
 *   },
 * })
 * # With a filesTree object and explicit parser
 * per file with the parsers object
 * const project = new Project({
 *   filesTree: {
 *     'path': 'content'
 *
 *   },
 *   parsers: {
 *     'js$': 'js.typescript',
 *     '(ts|tsx)$': 'js.typescript'
 *   }
 * })
 *
 * @examples Quering
 *
 * # Simple query
 * project.query('Selector')
 *
 * # Complex query with codemod and data transformation
 * project.query({
 *   someKey: {
 *     selector: 'Selector',
 *     data: {
 *       name: '.escapedText'
 *     },
 *     transform: (node, data) => ({
 *       ...data,
 *       name: `Selector: ${data.name}`
 *     }),
 *     codemod: (node, data) => node.replace(`
 *        somenewCode: ${data.name}
 *     `)
 *
 *   }
 * })
 */
export default class Project implements ProjectInterface {
  files: string[];
  parsers?: {
    [regexOrGlob: string]: ParserConfig | string;
  };
  constructor(props?: ProjectConfig) {
    if (props) {
      const { filesTree, files, readFile, parsers } = props;
      this.parsers = parsers;
      if (files) {
        if (Array.isArray(files)) {
          if (readFile) {
            this.readFile = readFile;
          } else {
            try {
              const fs = require('fs');
              this.readFile = (f) => fs.readFileSync(f, 'utf8');
            } catch (err) {
              throw new Error(
                'readFile is not defined and node-fs is not available'
              );
            }
          }
          this.files = files;
        }
        if (typeof files === 'string') {
          throw 'files:string Not implemented';
        }
      }
      if (filesTree) {
        this.files = Object.keys(filesTree);
        this.readFile = (file: string) => {
          return filesTree[file];
        };
      }
      this.parsedFiles = {};
      this.fileTree = [];

      this.files.forEach((f) => {
        this.fileTree.push(this.dummyFile(f));
      });
    }
  }
  readFile: (path: string) => string;
  writeFile: (path: string, content: string) => void;
  createFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  fileTree: ASTNode[];
  dummyFile = (name: string, ast?: ASTNode[] | ASTNode): ASTNode => {
    return {
      _type: 'File',
      ast,
      path: name,
      getText: () => {
        return this.readFile(name);
      },
      getFullText: () => {
        return this.readFile(name);
      },
      getFilePath() {
        return name;
      },
    };
  };
  updateFileTree = (): void => {
    this.fileTree = [];
    this.files.forEach((f) => {
      this.fileTree.push(this.dummyFile(f));
    });
  };
  parsedFiles: Record<string, Code>;
  createCodeInstance = (path: string): Code => {
    const content = this.readFile(path);
    if (!this.parsedFiles[path]) {
      let parser;
      if (this.parsers) {
        const parserKey = Object.keys(this.parsers).find((regex) => {
          return path.match(new RegExp(regex));
        });
        parser = parserKey && this.parsers[parserKey];
      }
      this.parsedFiles[path] = new Code(path, content, {
        parser,
      });
    }
    this.parsedFiles[path].setText(content);
    return this.parsedFiles[path];
  };
  query = async (selector: Selector): Promise<any> => {
    const multiCode = new Code('', '', {
      parser: {
        ...defaultParserInterface,
        loadParser(callback) {
          callback({});
        },
        parse() {
          return [];
        },
        getNodeName(node) {
          return node._type;
        },
      },
      queryPreHook: async (selector) => {
        if (selector.startsWith('File')) {
          const fileSelectorMatch = selector.match(/^File\[.*?\]/);
          if (fileSelectorMatch) {
            const fileSelector = fileSelectorMatch[0];
            const files = this.fileTree
              .filter((node) => {
                return matches(node, parse(fileSelector), [], {});
              })
              .map((f) => f.path);
            const codeInstances = files.map((f: string) =>
              this.createCodeInstance(f)
            );
            const result = await Promise.all(
              codeInstances.map(async (code) => {
                await code.parse();
                return code.ast;
              })
            );
            return this.dummyFile('root', result);
          }
        }
        return false;
      },
      // queryPostHook: async (selector, result) => {
      //   if (selector.startsWith('File')) {
      //     console.log(result)
      //   }
      //   return result;
      // }
    });
    const result = await multiCode.query(selector);

    return result;
  };
}
