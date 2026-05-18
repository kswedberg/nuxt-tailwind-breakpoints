import bamfNuxt from 'eslint-config-kswedberg/flat/nuxt.mjs';
import withNuxt from './playground/.nuxt/eslint.config.mjs';
import * as regexpPlugin from 'eslint-plugin-regexp';
import unicorn from 'eslint-config-kswedberg/flat/unicorn.mjs';

export default withNuxt(
  regexpPlugin.configs['flat/recommended'],
  ...bamfNuxt,
  ...unicorn,
  {
    name: 'bamf/rrx',
    languageOptions: {
      globals: {
        BrowserPrint: 'readonly',
        Iterator: 'readonly',
      },
    },
  },
  {
    files: ['app/components/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'warn',
    },
  },
  {
    rules: {
      'unicorn/prefer-number-properties': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-thenable': 'off',
      'unicorn/no-hex-escape': 'off',

      'vue/no-unused-properties': ['warn', {
        groups: ['data', 'computed', 'methods'],
      }],
      'vue/define-props-destructuring': ['error', {destructure: 'never'}],
      'vue/prefer-use-template-ref': 'warn',
      'vue/no-unused-refs': 'warn',
    },
  },
  {
    name: 'nuxt_tw/ignores',
    ignores: [
      'public/**/*',
    ],
  }
);
