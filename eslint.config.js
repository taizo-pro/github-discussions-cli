import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        node: true,
        jest: true,
        es6: true,
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Add any specific rules here if needed
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**']
  }
];