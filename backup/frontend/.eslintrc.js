module.exports = {
	'env': {
		'browser': true,
		'es6': true
	},
	'extends': 'airbnb',
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaFeatures': {
			'jsx': true
		},
		'ecmaVersion': 2018,
		'sourceType': 'module'
	},
	'parser': 'babel-eslint',
	'plugins': [
		'react'
	],
	'rules': {
		// off (0), warn (1), error (2)
		// react
		'react/react-in-jsx-scope': 0,
    'react/jsx-curly-spacing': [1, 'always'],
		'react/jsx-indent': [1, 'tab'],
		'react/jsx-indent-props': [1, 'tab'],
		'react/jsx-filename-extension': [1, { 'extensions': ['.js', '.jsx'] }],
		'react/jsx-uses-vars': [2],
		'jsx-a11y/anchor-is-valid': 0,

		// eslint
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
    'template-curly-spacing': [1, 'always'],
    "no-underscore-dangle": ["error", { "allow": ["__typename"] }],
	}
};
