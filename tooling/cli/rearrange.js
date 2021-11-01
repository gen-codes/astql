const glob = require('glob');
const fs = require('fs');
const path = require('path');

const parserPackages = glob.sync('../../parsers/*/*/package.json');
const libsPackages = glob.sync('../../libs/*/package.json');

const rush = require('../../rush.json');
rush.projects.forEach((project) => {
  const pkgFilePath = path.join('../..', project.projectFolder, 'package.json');
  const pkg = require(pkgFilePath);
  pkg.homepage = `https://github.com/gen-codes/astql/tree/main/${project.projectFolder}`;
  pkg.main = 'index.js';
  fs.writeFileSync(pkgFilePath, JSON.stringify(pkg, null, 2));
});
// libsPackages.forEach((packagePath) => {});
parserPackages.forEach((packagePath) => {
  const parserPkg = require(packagePath);
  const parserFolder = path.dirname(packagePath);
  const tsconfig = require(path.join(parserFolder, 'tsconfig.json'));
  tsconfig.compilerOptions.types = ['jest', 'node'];
  parserPkg.main = 'index.js';
  parserPkg.devDependencies = parserPkg.devDependencies || {};
  parserPkg.devDependencies['@digigov/cli-lint'] = '0.5.25';
  parserPkg.devDependencies['eslint'] = '~7.24.0';
  parserPkg.devDependencies['prettier'] = '~2.2.1';
  parserPkg.devDependencies = {
    ...parserPkg.devDependencies,
    '@types/jest': '27.0.2',
    '@types/node': '~16.11.6',
    '@digigov/cli-lint': '~0.5.25',
  };
  parserPkg.peerDependencies['@astql/languages'] = '0.1.3';
  parserPkg.scripts.watch = 'digigov build --watch';
  parserPkg.scripts.lint = 'digigov lint';
  const eslintrc = `module.exports = {
  extends: [
    require.resolve('@digigov/cli-lint/eslint.config'),
  ],
  "plugins": ["jest"],
  "env": {
    "jest/globals": true
  },
  globals: {
    Set: true,
  }
}`;
  fs.writeFileSync(path.join(parserFolder, '.eslintrc.js'), eslintrc);
  fs.writeFileSync(
    path.join(parserFolder, 'package.json'),
    JSON.stringify(parserPkg, null, 2)
  );
  fs.writeFileSync(
    path.join(parserFolder, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );
  try {
    fs.writeFileSync(
      path.join(parserFolder, 'src/tests/index.test.js'),
      fs
        .readFileSync(
          path.join(parserFolder, 'src/tests/index.test.js'),
          'utf8'
        )
        .replace(
          `import fs from 'fs';
import path from 'path';`,
          ''
        )
    );
  } catch (e) {
    console.log('Failed test creation in ', parserFolder);
  }
  console.log(`Updated ${path.basename(parserFolder)}`);
});
