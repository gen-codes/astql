/** @type {import('next').NextConfig} */
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const rush = require('../../rush.json')
const withTM = require('next-transpile-modules')(['react-monaco-editor']); // pass the modules you would like to see transpiled

module.exports = withTM({
  reactStrictMode: true,
  webpack: (config, { dev, defaultLoaders }) => {
    config.resolve.plugins.push(new TsconfigPathsPlugin())
    const projectFolders = rush.projects.reduce((acc, project) => {
      return acc.concat([
        path.resolve('../../', project.projectFolder), 
      path.resolve('../../', project.projectFolder, 'node_modules')
    ])
    },[])
    config.resolve.plugins.push(new TsconfigPathsPlugin())
    config.module.rules.push({
      test: /\.ts[x]*$/,
      use: [
        defaultLoaders.babel,
      ],
      include: projectFolders,
    })
    return config
  }
})
