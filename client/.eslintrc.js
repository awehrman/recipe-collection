module.exports = {
	"env": {
		"browser": true,
		"es6": true
	},
	"extends": "airbnb",
	"globals": {
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly"
	},
	"parserOptions": {
		"ecmaFeatures": {
			"jsx": true
		},
		"ecmaVersion": 2018,
		"sourceType": "module"
	},
	"parser": "babel-eslint",
	"plugins": [
		"react"
	],
	"rules": {
		// off (0), warn (1), error (2)
		// react
    "react/jsx-curly-spacing": [1, "always"],
		"react/jsx-indent": [1, "tab"],
		"react/jsx-indent-props": [1, "tab"],
		"react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],

		// eslint
		"array-bracket-spacing": [1, "always"],
		"indent": [1, "tab"],
    "no-console": 0,
		"no-tabs": 0,
		"object-curly-newline": [1, {
      "ObjectExpression":  { "multiline": true, "minProperties": 2 },
      "ObjectPattern": { "multiline": true, "minProperties": 10 },
      "ImportDeclaration": "never",
      "ExportDeclaration": { "multiline": true, "minProperties": 3 }
    }],
    "template-curly-spacing": [1, "always"],
	}
};