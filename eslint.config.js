import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import pluginQuery from "@tanstack/eslint-plugin-query"
import prettierConfig from "eslint-config-prettier"

export default tseslint.config(
  // 1. Bỏ qua các thư mục build / sinh tự động / assets tĩnh
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "public/**",
      "src/routeTree.gen.ts",
      "src/components/ui/**",
      "playwright-report/**",
      "playwright.config.ts"
    ]
  },

  // 2. Kế thừa configs chuẩn
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginQuery.configs["flat/recommended"],

  // 3. Cấu hình rule chung cho React & TypeScript
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // Hạ warn cho các rule mới của React 19 để không chặn luồng dev
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }
      ],
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  },

  // 4. Override riêng cho TanStack Router files (src/routes/**)
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      // TanStack Router bắt buộc export const Route = createFileRoute(...)
      "react-refresh/only-export-components": "off"
    }
  },

  // 5. Override riêng cho thư mục Tests (giảm nhiễu khi mock data)
  {
    files: ["tests/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  },

  // 6. BẮT BUỘC ĐẶT Ở CUỐI: Tắt toàn bộ rule format trùng với Biome
  prettierConfig
)
