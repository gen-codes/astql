const fs = require('fs');
const path = require('path');
const localRequire = (id) => {
  id = path.join(__dirname, id);
  if(id.endsWith('.txt')) {
    return fs.readFileSync(id, 'utf8');
  }
  return require(id);
};
const glob = require('glob');

function interopRequire(module) {
  return module.__esModule ? module.default : module;
}


const categoryByID = {};
const parserByID = {};
const transformerByID = {};

const restrictedParserNames = [
  'index.js',
  'codeExample.txt',
  'transformers',
  'transpilers',
  'utils',
  'yarn.lock',
  'tsconfig.json',
  'package.json',
  '.gitignore'
];
const restrictedParserNamesSet = new Set(restrictedParserNames);


export function getTransformerByID(id) {
  return transformerByID[id];
}
function prepareQuery(
  ast,
  typeKey,
  exclude,
  getNodeName
) {
  const traverse = (node, result) => {
    for(const key in node) {
      if(key === typeKey && typeof node[key] !== 'object')  {
        if(getNodeName) {

          const name = getNodeName(node);
          if(name) {
            node._type = name;
          }else{
            node._type = node[key];
          }
        }
        if(!result[node._type]) {
          result[node._type] = new Set([]);
        }
        Object.keys(node).forEach((key) => {
          !exclude.includes(key) && result[node._type].add(key);
        });
      }
      if(node.hasOwnProperty(key) && !exclude.includes(key)) {
        if(typeof node[key] === 'object') {
          result = traverse(node[key], result);
        }
      }
    }
    return result;
  };
  const allVisitorKeys = traverse(ast, {});
  return Object.keys(allVisitorKeys).reduce((acc, key) => {
    acc[key] = Array.from(allVisitorKeys[key]);
    return acc;
  }, {});
}
export class Parser {
  constructor(id, options) {
    if(typeof (id) === 'object') {
      options = id;
      const ext = options.fileExtension || options.filename.split('.').pop();
      id = glob.sync(`${__dirname  }/*`, { ignore: './node_modules/*' })
        .find(name => {
          if(restrictedParserNames.some(rname => name.includes(rname))) {
            return false;
          } else {
            try {
              const lang = require(name);
              if(lang.decideParser) {
                return lang.decideParser(ext);
              } else {
                return lang.fileExtension === ext;
              }
            } catch(error) {
              console.log('decideParser', error);
            }

          }
        });
      if(id) {
        id = id.split('/').pop();
      } else {
        return { parse: () => { } };
      }
    }

    this.id = id;
    this.cache = {};
    this.categoryByID = {};
    this.parserByID = {};
    this.category = this.loadCategory(id);

    if(options.filename && this.category.decideParser) {
      this.parser = this.getParserByID(this.category.decideParser(options.filename));
    } else {
      this.parser = this.getParserByID(options.parser) || this.getDefaultParser(this.category);
    }
    this.parser.loadParser((parser) => {
      this.parse = (
        source,
        options = this.parser.getDefaultOptions()
      ) => {
        if(!this.cache[source]){
          
          try {
            const ast = this.parser.parse(parser, source, options);
            const visitorKeys = prepareQuery(ast,
              Array.from(this.parser.typeProps)[0],
              Array.from(this.parser._ignoredProperties),
              this.parser.getNodeName
            );
            this.cache[source] = [ast, visitorKeys];
            return [ast, visitorKeys];
          } catch(err) {
            console.log('Parse error:', this.parser.id);
          }

        }else{
          return this.cache[source];
        }
      };
    });
  }
  getParserByID(id) {
    return this.parserByID[id];
  }
  loadCategory(catName) {
    const category = localRequire(`./${catName}/index.js`);

    this.categoryByID[category.id] = category;

    category.codeExample = interopRequire(localRequire(`./${catName}/codeExample.txt`));

    const catFiles =
      glob.sync(`./${catName}/*.js`, { cwd: __dirname })
        .map(name => name.split('/').slice(2));
    category.parsers =
      catFiles
        .filter(([parserName]) => !restrictedParserNamesSet.has(parserName))
        .map(([parserName]) => {
          const parser = interopRequire(localRequire(`./${catName}/${parserName}`));
          this.parserByID[parser.id] = parser;
          parser.category = category;
          return parser;
        });
    return category;
  }
  getDefaultParser(category) {
    return category.parsers.filter(p => p.showInMenu)[0];
  }
}