import { FlatCompat } from "@eslint/eslintrc";
import pkg from "@eslint/js"; 

const { configs } = pkg;

const compat = new FlatCompat({
  baseDirectory: process.cwd(),
  recommendedConfig: configs.recommended, 
});

export default [
  {
    ignores: ["node_modules/", "dist/", "coverage/", "combined.log", "error.log"], 
  },
  ...compat.config({
    env: {
      browser: false,
      node: true,
      es2021: true,
      
    },
    extends: "eslint:recommended",
    parserOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      jest: true,
    },
    rules: {
      semi: ["error", "always"],
      quotes: "off",
      "no-unused-vars": "off",
      "no-undef": "off", 
    },
  }),
];