module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['dist', 'node_modules'],
  overrides: [
    {
      files: ['test/**/*.ts'],
      env: {
        node: true,
        es2022: true,
      },
    },
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
