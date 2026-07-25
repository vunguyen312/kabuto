import js from '@eslint/js';
import { flatConfigs } from 'eslint-plugin-import-x';
import { configs as tseslintConfigs } from 'typescript-eslint';

export default [
  {
    ignores: ['.webpack/**', 'build/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslintConfigs.recommended,
  flatConfigs.recommended,
  flatConfigs.electron,
  flatConfigs.typescript,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-array-constructor': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
  },
];
