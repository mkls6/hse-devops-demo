import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/", "node_modules/"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        fetch: "readonly",
        Image: "readonly",
        MutationObserver: "readonly",
        getComputedStyle: "readonly",
        requestAnimationFrame: "readonly",
        console: "readonly",
      },
    },
  },
);
