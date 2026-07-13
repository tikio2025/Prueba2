import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "internal/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "assets/**"
    ]
  },
  js.configs.recommended,
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser
    },
    rules: {
      "eqeqeq": ["error", "always"],
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }]
    }
  },
  {
    files: ["js/store.js"],
    rules: {
      "no-control-regex": "off"
    }
  },
  {
    files: [
      "tools/**/*.mjs",
      "tests/**/*.js",
      "*.config.js"
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node
    },
    rules: {
      "eqeqeq": ["error", "always"],
      "no-console": "off",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }]
    }
  }
];
