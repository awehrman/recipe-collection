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
		"indent": [2, "tab", { "SwitchCase": 1, "VariableDeclarator": 1 }],
		"no-tabs": 0,
    "no-console": 0
	}
};