import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. Setup the Next.js and Core Web Vitals rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/*",
      "next-env.d.ts",
      ".node_modules/*",
      "out/*",
      "dist/*",
      "public/*",
    ],
  },

  // 2. Add your custom overrides here
  {
    rules: {
      "no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
