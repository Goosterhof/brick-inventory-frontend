import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
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
    rules: {
      'func-style': ['error', 'expression'],
    },
  },
)
