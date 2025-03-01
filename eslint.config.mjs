import eslintPluginImportX from "eslint-plugin-import-x";
import eslintPluginJs from "@eslint/js";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import eslintPluginStylistic from "@stylistic/eslint-plugin";
import globals from "globals";

const config = [
  eslintPluginJs.configs.all,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginStylistic.configs.all,
  ...eslintPluginJsonc.configs["flat/recommended-with-json"],
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node,
        config: "readonly"
      },
      sourceType: "commonjs"
    },
    rules: {
      "@stylistic/array-element-newline": ["error", "consistent"],
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/function-call-argument-newline": ["error", "consistent"],
      "@stylistic/function-paren-newline": "off",
      "@stylistic/indent": ["error", 2],
      "@stylistic/multiline-comment-style": "off",
      "@stylistic/multiline-ternary": "off",
      "@stylistic/no-multi-spaces": "off",
      "@stylistic/padded-blocks": ["error", "never"],
      "@stylistic/quote-props": ["error", "as-needed"],
      "capitalized-comments": "off",
      "consistent-this": "off",
      "default-case": "off",
      "func-style": "off",
      "id-length": "off",
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
      "sort-keys": "off",
      strict: "off"
    }
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node
      },
      sourceType: "module"
    },
    rules: {
      "@stylistic/array-element-newline": "off",
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/function-call-argument-newline": ["error", "consistent"],
      "@stylistic/function-paren-newline": "off",
      "@stylistic/indent": ["error", 2],
      "@stylistic/padded-blocks": ["error", "never"],
      "@stylistic/quote-props": ["error", "as-needed"],
      "func-style": "off",
      "max-lines-per-function": ["error", 100],
      "no-magic-numbers": "off",
      "one-var": "off",
      "prefer-destructuring": "off"
    }
  },
  {
    ignores: ["package-lock.json"]
  }
];

export default config;
