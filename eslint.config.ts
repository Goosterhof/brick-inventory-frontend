import stylistic from '@stylistic/eslint-plugin'
import pluginVitest from '@vitest/eslint-plugin'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import pluginImport from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'

import pluginAaaPattern from './eslint-plugins/aaa-pattern'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/tests/**/*.spec.ts'],
    plugins: {
      ...pluginVitest.configs.recommended.plugins,
      'aaa-pattern': pluginAaaPattern,
    },
    rules: {
      ...pluginVitest.configs.recommended.rules,
      'vitest/valid-title': ['error', {
        mustMatch: { it: ['^should'] },
      }],
      'vitest/padding-around-expect-groups': 'error',
      'vitest/padding-around-test-blocks': 'error',
      'aaa-pattern/enforce-comments': 'error',
    },
  },

  // Rules handled by oxlint (50-100x faster):
  // - func-style, prefer-const, no-console
  // - @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any
  // - import/first, import/no-duplicates, import/no-self-import, import/no-cycle
  // ESLint handles Vue-specific, import sorting, and custom rules below
  {
    name: 'app/rules',
    plugins: {
      'simple-import-sort': simpleImportSort,
      'import': pluginImport,
      '@stylistic': stylistic,
    },
    rules: {
      // Custom project rules (not in oxlint)
      'no-restricted-globals': ['error', {
        name: 'localStorage',
        message: 'Use the storage service (src/services/storage.ts) instead of localStorage directly.',
      }],
      // Import sorting with auto-fix (oxlint doesn't have auto-fix for sorting)
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // Import spacing
      'import/newline-after-import': 'error',
      // Stylistic rules
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
    },
  },
)
