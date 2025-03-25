module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.spec.json'
    ],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prefer-arrow'
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'
        ],
        filter: {
          regex: '^_.*$',
          match: false,
        },
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'
        ],
      },
      {
        selector: 'variable',
        modifiers: ['const'
        ],
        format: ['PascalCase', 'camelCase', 'UPPER_CASE'
        ],
      },
      {
        selector: 'interface',
        format: ['PascalCase'
        ],
        prefix: ['I'
        ],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'
        ],
      },
      {
        selector: 'memberLike',
        modifiers: ['private'
        ],
        format: ['camelCase'
        ],
        leadingUnderscore: 'require',
      },
      {
        selector: 'variable',
        types: ['boolean'
        ],
        format: ['PascalCase'
        ],
        prefix: ['is', 'should', 'has', 'can', 'did', 'will'
        ],
      },
    ],
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],
    'prefer-arrow-callback': ['error',
      {
        allowNamedFunctions: true
      }
    ],
    'func-style': ['error', 'expression',
      {
        allowArrowFunctions: true
      }
    ],
  },
}