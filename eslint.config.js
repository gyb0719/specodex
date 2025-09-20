import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/**", "spec-kit/**", "**/*.d.ts", "**/*.js"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: false
      }
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error"
    }
  }
);
