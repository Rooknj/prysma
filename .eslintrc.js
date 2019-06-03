module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    // Shared Configs
    "eslint:recommended",
    "plugin:eslint-comments/recommended",
    // Project Specific Configs
    "airbnb-base",
    // Make sure this is last
    "prettier",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: [
    // Shared Plugins
    "import",
    "prettier",
    // Project Specific Plugins
  ],
  rules: {
    // Shared Rules
    "no-console": "warn",
    "no-unused-vars": "warn",
    "prefer-destructuring": "warn",
    radix: "off",
    "no-underscore-dangle": "off",
    "prettier/prettier": "error",
    // Project Specific Rules
  },
};
