import eslintPluginImport from "eslint-plugin-import";
import eslintPluginJs from "@eslint/js";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import eslintPluginStylistic from "@stylistic/eslint-plugin";
import globals from "globals";

export default [
  eslintPluginJs.configs.all,
  eslintPluginImport.flatConfigs.recommended,
  ...eslintPluginJsonc.configs["flat/recommended-with-json"],
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node,
        config: "readonly"
      }
    },
    plugins: {
      ...eslintPluginStylistic.configs["all-flat"].plugins
    },
    rules: {
      ...eslintPluginStylistic.configs["all-flat"].rules,
      "@stylistic/array-element-newline": ["error", "consistent"],
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/function-call-argument-newline": ["error", "consistent"],
      "@stylistic/function-paren-newline": "off",
      "@stylistic/indent": ["error", 2],
      "@stylistic/multiline-comment-style": "off",
      "@stylistic/multiline-ternary": "off",
      "@stylistic/no-multi-spaces": "off",
      "@stylistic/quote-props": ["error", "as-needed"],
      "@stylistic/padded-blocks": ["error", "never"],
      "@stylistic/space-before-function-paren": "off",
      "capitalized-comments": "off",
      "consistent-this": "off",
      "default-case": "off",
      "func-style": "off",
      "id-length": "off",
      "import/namespace": "off",
      "init-declarations": "off",
      "line-comment-position": "off",
      "max-lines": "off",
      "max-lines-per-function": ["warn", 120],
      "max-statements": ["warn", 40],
      "multiline-comment-style": "off",
      "no-inline-comments": "off",
      "no-magic-numbers": "off",
      "no-negated-condition": "off",
      "no-ternary": "off",
      "no-undefined": "off",
      "no-warning-comments": "off",
      "one-var": "off",
      "prefer-destructuring": "off",
      "prefer-named-capture-group": "off",
      "require-await": "warn",
      "sort-keys": "off"
    }
  },
  {
    ignores: ["package-lock.json"]
  }
];
