const path = require('path');

const standardJsRules = {
  'jsx-a11y/anchor-is-valid': [
    'error',
    { components: ['Link'], specialLink: ['to'], aspects: ['noHref', 'invalidHref'] },
  ],
  'jsx-a11y/label-has-for': ['error', { components: ['Label'], allowChildren: true }],
  'jsx-quotes': ['error', 'prefer-single'],
  'lodash/prefer-lodash-method': ['error', { ignoreMethods: ['replace'] }],
  'max-len': ['error', { code: 120, ignoreUrls: true }],
  'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
  'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  'react-hooks/exhaustive-deps': 'warn',
  'react-hooks/rules-of-hooks': 'error',
  'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
  'react/jsx-fragments': ['error', 'element'],
  curly: ['error', 'all'],

  // Disabled rules
  'class-methods-use-this': 'off',
  'comma-dangle': 'off',
  'import/extensions': 'off',
  'import/no-absolute-path': 'off',
  'import/no-unresolved': 'off',
  'import/prefer-default-export': 'off',
  'jsx-a11y/alt-text': 'off',
  'jsx-a11y/click-events-have-key-events': 'off',
  'jsx-a11y/label-has-associated-control': 'off',
  'jsx-a11y/no-noninteractive-element-interactions': 'off',
  'lines-between-class-members': 'off',
  'lodash/import-scope': 'off',
  'lodash/chaining': 'off',
  'lodash/chain-style': 'off',
  'no-await-in-loop': 'off',
  'no-console': 'off',
  'no-debugger': 'off',
  'no-multi-spaces': 'off',
  'no-param-reassign': 'off',
  'no-return-assign': 'off',
  'no-underscore-dangle': 'off',
  'no-use-before-define': 'off' /* off since we declare styled-components below main */,
  'no-useless-rename': 'off',
  'object-curly-newline': 'off',
  'object-curly-spacing': 'off',
  'one-var': 'off',
  'one-var-declaration-per-line': 'off',
  'react/jsx-one-expression-per-line': 'off',
  'react/jsx-props-no-spreading': 'off',
  'react/no-children-prop': 'off',
  'react/no-unescaped-entities': 'off',
  'react/prop-types': 'off',
  'react/sort-comp': 'off',
  'space-infix-ops': 'off',
  'import/no-extraneous-dependencies': [
    'error',
    { devDependencies: ['**/*.test.tsx', '**/*.stories.tsx', '**/*.test.jsx', '**/*.stories.jsx'] },
  ] /* allow devDeps in test & story files */,
};
const standardJsExtends = ['airbnb', 'plugin:lodash/recommended', 'prettier', 'prettier/react'];
const standardJsPlugins = ['react-hooks', 'react', 'lodash', 'import'];
const standardTsRules = {
  // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
  // Poll / discussion of options: https://getdutchie.slack.com/archives/C01HVTBB685/p1610469361156600
  '@typescript-eslint/adjacent-overload-signatures': 'error' /* ts-recommended */,
  '@typescript-eslint/await-thenable': 'error' /* ts-recommended */,
  '@typescript-eslint/ban-ts-comment': 'error' /* ts-recommended */,
  '@typescript-eslint/ban-types': 'error' /* ts-recommended */,
  '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }],
  '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
  '@typescript-eslint/member-delimiter-style': [
    'error',
    { multiline: { delimiter: 'semi' }, singleline: { delimiter: 'semi' } },
  ],
  '@typescript-eslint/member-ordering': ['error', { default: ['signature', 'field', 'constructor', 'method'] }],
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'default',
      format: ['camelCase'],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'variable',
      format: ['camelCase', 'PascalCase' /* react Component */, 'UPPER_CASE'],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'function',
      format: ['PascalCase' /* react Component */, 'camelCase'],
    },
    {
      selector: 'typeLike',
      format: ['PascalCase'],
    },
  ],
  '@typescript-eslint/no-array-constructor': 'error' /* ts-recommended */,
  '@typescript-eslint/no-base-to-string': 'error',
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-function': 'error' /* ts-recommended */,
  '@typescript-eslint/no-empty-interface': 'error' /* ts-recommended */,
  '@typescript-eslint/no-extra-non-null-assertion': 'error' /* ts-recommended */,
  '@typescript-eslint/no-extra-semi': 'error' /* ts-recommended */,
  '@typescript-eslint/no-extraneous-class': 'error',
  '@typescript-eslint/no-floating-promises': 'error' /* ts-recommended */,
  '@typescript-eslint/no-for-in-array': 'error' /* ts-recommended */,
  '@typescript-eslint/no-implied-eval': 'error' /* ts-recommended */,
  '@typescript-eslint/no-inferrable-types': 'error' /* ts-recommended */,
  '@typescript-eslint/no-misused-new': 'error' /* ts-recommended */,
  '@typescript-eslint/no-misused-promises': 'error' /* ts-recommended */,
  '@typescript-eslint/no-namespace': 'error' /* ts-recommended */,
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error' /* ts-recommended */,
  '@typescript-eslint/no-non-null-assertion': 'error' /* ts-recommended */,
  '@typescript-eslint/no-shadow': 'error' /* fixes issues with no-shadow + ts */,
  '@typescript-eslint/no-this-alias': 'error' /* ts-recommended */,
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
  '@typescript-eslint/no-unnecessary-condition': 'error',
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error' /* ts-recommended */,
  '@typescript-eslint/no-unused-vars': 'error' /* ts-recommended */,
  '@typescript-eslint/no-var-requires': 'error' /* ts-recommended */,
  '@typescript-eslint/non-nullable-type-assertion-style': 'error',
  '@typescript-eslint/prefer-as-const': 'error' /* ts-recommended */,
  '@typescript-eslint/prefer-enum-initializers': 'error',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-literal-enum-member': 'error',
  '@typescript-eslint/prefer-namespace-keyword': 'error' /* ts-recommended */,
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/prefer-reduce-type-parameter': 'error',
  '@typescript-eslint/prefer-regexp-exec': 'error' /* ts-recommended */,
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',
  '@typescript-eslint/restrict-plus-operands': 'error' /* ts-recommended */,
  '@typescript-eslint/restrict-template-expressions': 'error' /* ts-recommended */,
  '@typescript-eslint/sort-type-union-intersection-members': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/triple-slash-reference': 'error' /* ts-recommended */,
  '@typescript-eslint/unbound-method': 'error' /* ts-recommended */,

  // Recommended but disabled while converting from JS to TS
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-parameter-properties': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',

  // Disabled rules
  '@typescript-eslint/no-use-before-define': 'off' /* off since we declare styled-components below main */,
  '@typescript-eslint/promise-function-async': 'off' /* by popular decree */,
  '@typescript-eslint/strict-boolean-expressions': 'off',
  'default-case': 'off' /* TS can check exhaustiveness */,
  'lodash/prefer-is-nil': 'off' /* TS null/undefined checks are typeguards */,
  'lodash/prefer-lodash-method': 'off' /* we were mainly using for nice null handling */,
  'lodash/prefer-lodash-typecheck': 'off' /* typechecks are safe in TS */,
  'lodash/prefer-noop': 'off' /* don't prefer noop in TS */,
  'no-empty-function': 'off' /* replaced by @typescript-eslint/no-empty-function */,
  'no-shadow': 'off' /* replaced by @typescript-eslint/no-shadow */,
  'no-useless-constructor': 'off' /* replaced by @typescript-eslint/no-useless-constructor */,
  'no-void': 'off' /* for no-floating-promises */,
  'react/require-default-props': 'off' /* TS makes proptypes redundant */,
  'import/no-extraneous-dependencies': [
    'error',
    { devDependencies: ['**/*.test.tsx', '**/*.stories.tsx'] },
  ] /* allow devDeps in test & story files */,
};
const standardTsPlugins = ['@typescript-eslint', 'jest'];
const standardTsExtends = [];

const i18nExtends = ['plugin:i18next/recommended', 'plugin:jsx-a11y/recommended'];
const i18nPlugins = ['i18next', 'jsx-a11y'];
const i18nRules = {
  'i18next/no-literal-string': [
    'error',
    {
      ignoreCallee: ['t'],
      ignoreAttribute: [
        'as',
        'MM/DD/YYYY',
        'align',
        'alignItems',
        'anchor',
        'aria-controls',
        'aria-label',
        'aria-labelledby',
        'aria-roledescription',
        'autoComplete',
        'alt',
        'bg',
        'borderRadius',
        'bottom',
        'cardSize',
        'center',
        'color',
        'data-testid',
        'data-cy',
        'data-test',
        'direction',
        'display',
        'fill',
        'filterId',
        'fit',
        'flexDirection',
        'flexWrap',
        'fontSize',
        'fontWeight',
        'h:mm a',
        'height',
        'href',
        'i18nKey',
        'id',
        'img',
        'justify',
        'lineHeight',
        'm',
        'margin',
        'mb',
        'md',
        'mediaQuery',
        'minHeight',
        'minWidth',
        'ml',
        'mr',
        'mt',
        'name',
        'p',
        'padding',
        'page',
        'pb',
        'pl',
        'position',
        'pr',
        'property',
        'pt',
        'py',
        'right',
        'role',
        'route',
        'size',
        'sm',
        'src',
        'top',
        'value',
        'variant',
        'x',
      ],
      ignoreProperty: ['vertical', 'horizontal', 'key', 'value'],
      ignore: ['xs', 'sm', 'md', 'lg', 'xl', 'relative'],
    },
  ],
  'jsx-a11y/label-has-associated-control': 1,
  'jsx-a11y/anchor-is-valid': 1,
  'jsx-a11y/no-noninteractive-element-interactions': 1,
  'jsx-a11y/click-events-have-key-events': 1,
  'jsx-a11y/alt-text': 1,
  'jsx-a11y/label-has-for': 1,
};

module.exports = {
  globals: { JSX: 'readonly' },
  env: {
    browser: true,
    es6: true,
    node: true,
    'jest/globals': true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true,
    },
    ecmaVersion: '2018',
  },
  extends: standardJsExtends,
  plugins: standardJsPlugins,
  rules: standardJsRules,
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    createTsRules('admin'),
    createTsRules('marketplace', {
      // don't use i18n rules for stories and tests, but keep other TS rules
      extensions: ['stories.ts', 'stories.tsx', 'test.ts', 'test.tsx'],
    }),
    createTsRules('marketplace', {
      withPlugins: i18nPlugins,
      withExtends: i18nExtends,
      withRules: i18nRules,

      excludedFiles: ['*.stories.*', '*.test.*'],
    }),
    createJsRules('marketplace', {
      withPlugins: i18nPlugins,
      withExtends: i18nExtends,
      withRules: i18nRules,

      // use standard rules for stories and tests
      excludedFiles: ['*.stories.*', '*.test.*', 'tests.*'],
    }),
    createTsRules('scripts/generate-changelogs', {
      folders: [''],
    }),
  ],
};

function createTsRules(appFolder, { withPlugins = [], withExtends = [], withRules = [], ...baseOptions } = {}) {
  return createRules(appFolder, {
    extensions: ['ts', 'tsx'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: `${appFolder}/tsconfig.json`,
      tsconfigRootDir: __dirname,
    },
    plugins: [...standardTsPlugins, ...withPlugins],
    rules: { ...standardTsRules, ...withRules },
    extends: [...standardTsExtends, ...withExtends],
    ...baseOptions,
  });
}

function createJsRules(appFolder, { withPlugins = [], withExtends = [], withRules = [], ...baseOptions } = {}) {
  return createRules(appFolder, {
    plugins: [...standardJsPlugins, ...withPlugins],
    rules: { ...standardJsRules, ...withRules },
    extends: [...standardJsExtends, ...withExtends],
    ...baseOptions,
  });
}

function createRules(appFolder, options = {}) {
  const folders = options.folders || ['src', 'shared'];
  const extensions = options.extensions || ['js', 'jsx'];
  const files =
    options.files ||
    folders.flatMap((folder) =>
      extensions.flatMap((extension) => path.join('.', appFolder, folder, `/**/*.${extension}`))
    );
  return {
    files,
    parser: options.parser || '@babel/eslint-parser',
    parserOptions: options.parserOptions || {},
    plugins: options.plugins || [],
    extends: options.extends || [],
    rules: options.rules || [],
    excludedFiles: options.excludedFiles || [],
  };
}
