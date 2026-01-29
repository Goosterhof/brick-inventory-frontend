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

  {
    name: 'app/rules',
    plugins: {
      'simple-import-sort': simpleImportSort,
      'import': pluginImport,
      '@stylistic': stylistic,
    },
    rules: {
      'func-style': ['error', 'expression'],
      'prefer-const': 'error',
      'no-console': 'error',
      'no-restricted-globals': ['error', {
        name: 'localStorage',
        message: 'Use the storage service (src/services/storage.ts) instead of localStorage directly.',
      }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
    },
  },
)
