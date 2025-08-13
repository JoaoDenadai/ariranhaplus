import eslintPlugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default {
  files: ["**/*.ts"],
  ignores: ["plugins/**"],
  languageOptions: {
    parser: parser,
    parserOptions: {
      project: "./tsconfig.json",
    },
  },
  plugins: {
    "@typescript-eslint": eslintPlugin,
  },
  rules: {
    semi: ["error", "always"],
    "prefer-const": "warn",
    "no-use-before-define": "error",
    "@typescript-eslint/array-type": "warn",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-use-before-define": "error",
    "@typescript-eslint/promise-function-async": "error",
  },
};
