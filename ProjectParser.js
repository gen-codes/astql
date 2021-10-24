const {Parser} = require('./languages-old/index');
const glob = require('glob');
const fs = require('fs-extra');
const path = require('path');
const astql = require('astql');

class Project {
  constructor(projectPath, options) {
    this.projectPath = projectPath;
    this.options = options;
    this.treeast = [];
    glob.sync(this.projectPath, {
      ignore: ['*node_modules*'],
      nodir: true
    }).forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const parser = new Parser({filename: file});
      const result = parser.parse(content);
      result && this.treeast.push({
        _type: 'FilePath',
        name: file,
        content,
        ast: result[0],
        visitorKeys: {FilePath: ['ast'], ...result[1]},
        parser
      });
    });
  }
  query(pattern, selector) {
    const files = this.treeast.filter(({name}) => {return name.match(pattern);});
    return files.map(f => {
      const result = astql(f.ast, selector, {
        visitorKeys: f.visitorKeys
      });
      if(result.length > 0) {
        return {
          file: f.name,
          result
        };
      }
    }).filter(f => f);
  }
  traverseDataSelector(dataSelector, ast, root, parentData, parentQuery) {
    const values = {};
    for(const key in dataSelector) {
      const objSelector = dataSelector[key];
      let isArray = false;
      let isObject = false;
      let selector = '';
      let data;
      if(Array.isArray(objSelector)) {
        if(typeof objSelector[0] === 'function') {
          values[key] = objSelector[0](ast, values);
          continue;
        } else if(typeof objSelector[0] === 'string') {
          selector = objSelector[0];
        } else {
          selector = objSelector[0].selector;
          data = objSelector[0].data;
        }
        isArray = true;
      } else if(typeof objSelector === 'object') {
        isObject = true;
        selector = objSelector.selector;
        data = objSelector.data;
      } else {
        selector = objSelector;
      }
      if(typeof selector === 'function') {
        selector = selector(values);
      }
      let isRootQuery = false;
      if(selector.startsWith('$>')) {
        isRootQuery = true;
        selector = selector.replace(/^(\$>)/, '');
        ast = root.ast;
      }
      if(parentQuery && !isRootQuery) {
        selector = parentQuery + (selector.match(/^[:.>]/) ? selector : ' ' + selector);
      }
      const result = astql(ast, selector, {
        visitorKeys: root.visitorKeys
      });
      if(!isArray && !isObject) {
        values[key] = result[0];
        continue;
      }
      if(result.length) {
        if(data) {
          if(isArray) {
            values[key] = result.map(r => {
              return this.traverseDataSelector(
                data,
                r,
                root,
                values,
                r._type);
            });
          } else if(isObject) {
            values[key] = this.traverseDataSelector(
              data,
              result[0],
              root,
              values,
              result[0]._type
            );
          }
        } else {
          if(isArray) {
            values[key] = result;
          } else {
            values[key] = result[0];
          }
        }

      }
    }
    return values;
  }
  extractData(pattern, dataSelector) {
    const files = this.treeast.filter(({name}) => {return name.match(pattern);});
    return files.map(f => {
      const result = this.traverseDataSelector(dataSelector, f.ast, f, {});
      return {
        file: f.name,
        content: f.content,
        result
      };
    }).filter(f => f);
  }
}
const queries = {
  components: [{
    selector: 'VariableDeclaration:has(QualifiedName>Identifier[escapedText=FC])',
    data: {
      name: '>Identifier.escapedText',
      parameters: [{
        selector: 'Parameter BindingElement',
        data: {
          name: '>Identifier.escapedText'
        }
      }],
      interface: {
        selector: (values) => `$>InterfaceDeclaration[name.escapedText=${values.name}Props]`,
        data: {
          name: '>Identifier.escapedText',
          properties: [{
            selector: '>PropertySignature',
            data: {
              name: '>Identifier.escapedText',
              'type': [(property, values) => property.type.getText()]
            }
          }]
        }
      }
    }
  }, {files: '*.tsx'}]
};

// const project = new Project('../../Grnet/digigov-meta/digigov-sdk/libs/ui/src/core/**/*.tsx', {});
// const search = project
//   .extractData(/\.tsx$/, queries);
const project = new Project('./languages-old/*/*', {});
const search = project
  .extractData(/\.js$/, {
    parse: ['CallExpression>ArrayLiteralExpression StringLiteral.text'],
  });
// .query(/\.tsx$/, 'VariableDeclaration:has(Identifier[escapedText=FC]).name.escapedText');
// .map(f => ({...f,result:f.result.map(r => r)}));
// console.log(search);
const tsconfig = {
  "include": [
    "./index.ts",
    "./utils/*",
  ],
  "exclude": [
    "node_modules",
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
    },
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
  }
};
const filetree = {};
const pkg = require('./package.json');
const projects = [];
search.forEach(({file, content, result}) => {
  const [_, lang] = file.match(/\.\/languages-old\/(.*?)\/.*?.js/);
  if(!filetree[lang]) {
    filetree[lang] = {
      parsers: []
    };
  }
  if(file.endsWith('index.js')) {
    projects.push({
      packageName: `@astql/${lang}`,
      projectFolder: `languages/${lang}`,
      reviewCategory: 'language',
      shouldPublish: true,
    });
    filetree[lang].package = {
      files: {
        'index.js': content,
        'package.json': JSON.stringify({
          name: `@astql/${lang}`,
          "main": "index.js",
          "files": [
            "index.js",
            "utils/"
          ],
          scripts: {
            build: "echo 'build'"
          },
          version: '0.0.1',
        }, null, 2)
      },
      lang
    };
  } else {
    const [_, parser] = file.match(/\.\/languages-old\/.*?\/(.*?)\.js/);
    projects.push({
      packageName: `@astql/${lang}.${parser}`,
      projectFolder: `languages/${lang}/parsers/${parser}`,
      reviewCategory: 'parser',
      shouldPublish: true,
    });
    try {
      fs.copySync(`languages-old/${lang}/codeExample.txt`, `languages/${lang}/codeExample.txt`);
      fs.copySync(`languages-old/${lang}/utils`, `languages/${lang}/utils`);

    } catch(e) {console.log(e);}

    filetree[lang].parsers.push({
      files: {
        'index.js': content.replace(
          `import defaultParserInterface from '../utils/defaultParserInterface';`
          , `import defaultParserInterface from 'astql/utils/defaultParserInterface'`
        ).replace(
          `import defaultParserInterface from './utils/defaultParserInterface';`
          , `import defaultParserInterface from '@astql/${lang}.${parser}/utils/defaultParserInterface'`
        ),
        'package.json': JSON.stringify({
          name: `@astql/${lang}.${parser}`,
          "main": "index.js",
          "files": [
            "index.js",
            "utils/"
          ],
          version: '0.0.0',
          scripts: {
            build: 'echo "build"'
          },
          peerDependencies: {
            [`@astql/${lang}`]: '0.0.0',
            astql: '0.0.0',
          },
          devDependencies: {
            'typescript': '^4.0.3'
          },
          dependencies: result.parse?.map(imp => {
            if(imp.startsWith('@')) {
              return imp.split('/').slice(0, 2).join('/');
            } else if(!imp.startsWith('.')) {
              return imp.split('/').slice(0, 1)[0];
            }
          }).filter(i => i).reduce((deps, i) => {
            deps[i] = pkg.dependencies[i];
            return deps;
          }, {})
        }, null, 2),

      },
      parser,
    });
  }
});
const rush = require('./rush.json');
projects.push({
  packageName: 'astql',
  projectFolder: 'lib/astql',
  shouldPublish: true,
});
rush.projects = projects;
fs.outputFileSync('rush.json', JSON.stringify(rush, null, 2));
for(const lang in filetree) {
  for(const file in filetree[lang].package.files) {
    fs.outputFileSync('./languages/' + lang + '/' + file, filetree[lang].package.files[file]);
  }

  filetree[lang].parsers.forEach(p => {
    for(const file in p.files) {
      fs.outputFileSync('./languages/' + lang + '/parsers/' + p.parser + '/' + file, p.files[file]);
    }
  });

}
console.log(filetree);
debugger;