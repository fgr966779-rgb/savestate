/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },

  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
  ],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'prettier',
  ],

  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },

  rules: {
    /* React / React Native */
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-raw-text': 'warn',
    'react-native/no-color-literals': 'off',
    'react-native/no-single-element-style-arrays': 'error',
    'react-native/sort-styles': 'off',
    'react-native/no-unused-styles': 'warn',
    'react/display-name': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',

    /* TypeScript */
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        allowHigherOrderFunctions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE', 'PascalCase'],
      },
      {
        selector: 'property',
        format: ['camelCase', 'snake_case', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
    ],

    /* General */
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],
    'prefer-const': 'error',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error', { allow: ['req', 'res', 'err', 'error', 'state', 'dispatch'] }],
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'curly': ['error', 'all'],
    'no-param-reassign': ['error', { props: false }],
    'no-return-await': 'off',
    '@typescript-eslint/return-await': ['error', 'in-try-catch'],
  },

  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
        'jest/globals': true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'react-native/no-inline-styles': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      files: ['e2e/**/*.ts', 'e2e/**/*.test.ts'],
      env: {
        'detox/global': true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint': 'off',
      },
    },
  ],

  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'web/',
    '.expo/',
    'dist/',
    'build/',
    'coverage/',
    '*.config.js',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    'detox.config.js',
    'eas.json',
  ],
};
