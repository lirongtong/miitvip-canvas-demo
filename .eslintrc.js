module.exports = {
	root: true,
	env: {
		node: true
	},
	extends: [
		'plugin:vue/essential',
		'eslint:recommended',
		'@vue/typescript/recommended'
	],
	parserOptions: {
		ecmaVersion: 2020
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-tabs': 'off',
		indent: [0, 'tab'],
		'object-curly-spacing': ['error', 'never'],
		semi: 0,
		'object-property-newline': 'off',
		'space-before-function-paren': ['error', {
			anonymous: 'always',
			named: 'never',
			asyncArrow: 'always'
		}],
		'eol-last': 'off',
		'quote-props': ['error', 'as-needed'],
		'no-trailing-spaces': ['error', {
			skipBlankLines: true,
			ignoreComments: true
		}],
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/camelcase': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/class-name-casing': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'vue/valid-v-on': 'off',
		'vue/valid-v-for': 'off',
		'vue/valid-v-else': 'off',
		'vue/no-unused-vars': 'off',
		'vue/no-parsing-error': [
			2,
			{
				'x-invalid-end-tag': false
			}
		],
		'no-useless-escape': 'off',
		'no-extra-boolean-cast': 'off',
		'no-case-declarations': 'off'
	}
}
