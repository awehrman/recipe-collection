module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
  	// off (0), warn (1), error (2)
		'array-bracket-spacing': [1, 'always'],
		'indent': [1, 'tab'],
		'max-len': [1, { 'code': 150 }],
		'no-bitwise': [2, { 'allow': ['~'] }],
    'no-console': 0,
		'no-tabs': 0,
		'object-curly-newline': [1, {
      'ObjectExpression':  { 'multiline': true, 'minProperties': 2 },
      'ObjectPattern': { 'multiline': true, 'minProperties': 10 },
      'ImportDeclaration': 'never',
      'ExportDeclaration': { 'multiline': true, 'minProperties': 3 }
    }],
		'template-curly-spacing': [ 1, 'always' ],
    'no-use-before-define': ["error", { "functions": true, "classes": true }],
  },
};
