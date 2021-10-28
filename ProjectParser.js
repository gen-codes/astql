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
  "extends": "@digigov/cli-build/tsconfig.base",
  "include": ["./src/**/*.ts","./src/**/*.js"],
  
  "exclude": [
    "node_modules",
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
    },
    "skipLibCheck": true,
    "strict": false,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "dist"

  }
};
const filetree = {};
const pkg = require('./package.json');
const projects = [];
search.forEach(({file, content, result}) => {
  if(file.match(/\.\/languages-old\/utils/)) {
    return;
  }
  const [_, lang] = file.match(/\.\/languages-old\/(.*?)\/.*?.js/);
  if(!filetree[lang]) {
    filetree[lang] = {
      parsers: []
    };
  }
  const codeExample = fs.readFileSync(`languages-old/${lang}/codeExample.txt`, 'utf8');

  if(file.endsWith('index.js')) {
    fs.outputFileSync(`libs/astql/src/languages/${lang}/index.js`, 
      content + `\nexport const defaultParser = '${filetree[lang].parsers[0]?.parser}';`
    );
  } else {
    const [_, parser] = file.match(/\.\/languages-old\/.*?\/(.*?)\.js/);
    projects.push({
      packageName: `@astql/${lang}.${parser}`,
      projectFolder: `parsers/${lang}/${parser}`,
      reviewCategory: 'parser',
      shouldPublish: true,
      publishFolder: 'dist',
    });
    try {
      glob.sync(`languages-old/${lang}/utils/*`).forEach(f => {
        const filename = f.replace(`languages-old/${lang}/utils/`, '')
        fs.outputFileSync(
          `libs/astql/src/languages/${lang}/utils/${filename}`,
          fs.readFileSync(f, 'utf8')
           .replace('../../utils/defaultParserInterface', `../../../utils/defaultParserInterface`)
        );

      })
    } catch(e) {
    }
    filetree[lang].parsers.push({
      files: {
        'tsconfig.json': JSON.stringify(tsconfig, null, 2),
        'src/tests/codeExample.js': `export default \`${codeExample
          .replace(/`/g, '\\\`')
          .replace(/\$/g, '\\\$')
        }\``,
        'CHANGELOG.md': ' ',
        'src/tests/index.test.js': `
import {Code} from 'astql';
import fs from 'fs';
import path from 'path';
import codeExample from './codeExample.js';

const code = new Code('file.${lang}', codeExample, {
  parser: require('../index.js').default,
});
it('code should parse without error', async () => {
  await code.parse()
  expect(code.ast).toHaveProperty('_type');
});
it('ast.getFullText() should match codeExample.txt', async () => {
  expect(code.ast.getFullText()).toMatchSnapshot();
});
it('should query generated ast', async () => {
  const result = await code.query('*')
  expect(result.length).not.toBe(0);
  expect(result.length).toMatchSnapshot();
});
`,
        'src/index.js': `import {multipleRequire} from 'astql';\n` + content.replace(
          `import defaultParserInterface from '../utils/defaultParserInterface'`
          , `import defaultParserInterface from 'astql/utils/defaultParserInterface'`
        ).replace(
          '../js/utils/defaultESTreeParserInterface', `astql/languages/js/utils/defaultESTreeParserInterface`
        )
        .replace(
          './utils/defaultESTreeParserInterface', `astql/languages/js/utils/defaultESTreeParserInterface`
        )
        .replace(
          '../utils', `astql/languages/${lang}/utils`
        ).replace(
          './utils', `astql/languages/${lang}/utils`
        )
        .replace(
          '../js/utils', `astql/languages/${lang}/utils`
        )
          .replace(
            `require('../multiple-require')`, `multipleRequire`
          ),
        'README.md': `
# ASTQL Parser ${parser} for ${lang}
`,
        'CHANGELOG.md': ``,
        'package.json': JSON.stringify({
          name: `@astql/${lang}.${parser}`,
          "main": "index.js",
          version: '0.1.0',
          scripts: {
            build: 'digigov build --subpackages',
            test: 'digigov test src'
          },
          peerDependencies: {
            astql: '0.1.1',
          },
          devDependencies: {
            "@digigov/cli": "~0.5.24",
            "@digigov/cli-build": "0.5.24",
            "@digigov/cli-test": "0.5.24",
            "rimraf": "~3.0.2",
            "typescript": "4.4.4"
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
  projectFolder: 'libs/astql',
  shouldPublish: true,
  reviewCategory: 'library',
  publishFolder: 'dist',
});
rush.projects = projects;
fs.outputFileSync('rush.json', JSON.stringify(rush, null, 2));
fs.outputFileSync('./parsers/CHANGELOG.md', ' ');
fs.outputFileSync('./parsers/LICENCE', 'TBD');
const exportLangIndex = Object.keys(filetree).map(lang => 
  `import * as ${lang} from './${lang}';
export {${lang}};`).join('\n')
fs.outputFileSync(
  './libs/astql/src/languages/index.ts',
  exportLangIndex 
);
for(const lang in filetree) {

  filetree[lang].parsers.forEach(p => {
    for(const file in p.files) {
      fs.outputFileSync('./parsers/' + lang + '/' + p.parser + '/' + file, p.files[file]);
    }
  });

}
console.log(filetree);
debugger;