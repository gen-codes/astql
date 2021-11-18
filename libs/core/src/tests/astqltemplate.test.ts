import type { Selector } from '..';
import Code from '../Code';
import fs from 'fs';
const text = fs.readFileSync('./src/tests/artifacts/astqltemplate.js', 'utf8');
// const result = fs.readFileSync(
//   './src/tests/artifacts/astqltemplate.result.js',
//   'utf8'
// );
const toSource = (i) => (Array.isArray(i) ? i.map((j) => j._text) : i._text);
const PartialsQuery = [
  {
    selector: 'CallExpression TaggedTemplateExpression',
    data: {
      name: '>Identifier.escapedText',
      template: 'NoSubstitutionTemplateLiteral.rawText',
    },
  },
];
const queries: Selector = {
  imports: {
    value: ['ImportDeclaration'],
    transform: toSource,
  },

  templates: [
    {
      selector: `
      ExpressionStatement:matches(
        ExpressionStatement:has(
          BinaryExpression ArrowFunction
        ) + 
        ExpressionStatement:has(
          NoSubstitutionTemplateLiteral
        ), 
        ExpressionStatement:has(BinaryExpression ArrowFunction) 
      )`,
      data: {
        name: 'BinaryExpression>Identifier.escapedText',
        template: 'NoSubstitutionTemplateLiteral.text',
        partials: [(e) => e.expression?._type],
        // argd: ['BinaryExpression Parameter.type'],
        args: [
          {
            selector: 'BinaryExpression Parameter',
            data: {
              fullParams: { value: ' ', transform: toSource },
              name: 'Identifier.escapedText',
              type: { value: ' ', transform: (t) => toSource(t.type) },
            },
          },
        ],
      },
      transform: (data) => {
        return data.reduce((acc, curr) => {
          if (curr.name) {
            acc[acc.length] = curr;
          } else {
            acc[acc.length - 1].template = curr.template;
          }
          return acc;
        }, []);
      },
    },
  ],
  staticWithMetadata: [
    {
      selector: `
      ExpressionStatement:has(BinaryExpression CallExpression)
      `,
      data: {
        name: 'Identifier.escapedText',
        template: 'CallExpression NoSubstitutionTemplateLiteral.rawText',
        partials: PartialsQuery,
      },
      codemod: (...args) => {
        console.log(args);
        return args;
      },
    },
  ],
};

const code = new Code('astqltemplate.js', text, {
  parser: 'js.typescript',
});

async function test() {
  await code.parse();
  const result = await code.query(queries);
  const newCode = `
${result.imports.join('\n')}
${result.templates
  .map((t) => {
    return `
export const  ${t.name}(${t.args.map((p) => p.fullParams).join(', ')}): string {
  const {file, partial} = useContext(FileContext)
  const template = file.compile(\`${t.template}\`)
  return template({ params}) 
}`;
  })
  .join('\n')})}  
`;
  result.code = newCode;
  fs.writeFileSync(
    './src/tests/artifacts/astqltemplate.result.gen.js',
    newCode
  );
  return result;
}

test().then((res) => {
  console.log(res);
});
describe('match', function () {
  it('match complex ts query', async function () {
    expect(await test()).toMatchSnapshot();
  });
});
