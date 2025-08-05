import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["**/*.ts"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: "./tsconfig.json",
    },
  },
  plugins: {
    "@typescript-eslint": tseslint.plugin,
  },
  rules: {
    semi: ["error", "always"],
    "prefer-const": "warn",
    "no-use-before-define": "error",
    "@typescript-eslint/array-type": "warn",
    "@typescript-eslint/consistent-return": "error",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-require-imports": "warn",
    "@typescript-eslint/no-use-before-define": "error",
    "@typescript-eslint/promise-function-async": "error",
  },
});
