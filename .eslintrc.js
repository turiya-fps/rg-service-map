/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const { library } = require('@project-rouge/service-core-eslint');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  env: {
    node: true,
    commonjs: true,
    es6: true,
  },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
    project: './tsconfig.json',
  },

  ...library,

  rules: {
    ...library.rules,

    'import/no-restricted-paths': ['error', {
      zones: [
        { target: './client', from: './deploy' },
        { target: './client', from: './service' },

        { target: './deploy', from: './client' },
        { target: './deploy', from: './service' },

        { target: './service', from: './client' },
        { target: './service', from: './deploy' },
      ],
    }],
  },
};
