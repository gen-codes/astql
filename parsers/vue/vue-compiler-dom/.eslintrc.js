module.exports = {
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
}