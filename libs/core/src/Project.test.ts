import Project from './Project';
import glob from 'glob';
const { raw } = String;
const project = new Project({
  files: glob.sync('../../parsers/*/*/src/*'),
  parsers: {
    js$: 'js.typescript',
    '(ts|tsx)$': 'js.typescript',
  },
});

it('queries multiple files', async () => {
  const result = await project.query({
    identifiers: [
      {
        selector: raw`File[path=regex(/\.js$/)]`,
        data: {
          path: [(node) => node.getFilePath()],
          ids: ['Identifier.escapedText'],
          vars: {
            value: ['VariableDeclaration.name.escapedText'],
            codemod: () => {
              return [];
            },
          },
        },
        // transform: (node) => {
        //   // node.replaceWith('');
        // },
      },
    ],
  });
  expect(result).toMatchSnapshot();
});
