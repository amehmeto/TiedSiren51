/**
 * @fileoverview Tests for one-view-model-per-file rule
 */

const { RuleTester } = require('eslint')
const rule = require('./one-view-model-per-file.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('one-view-model-per-file', rule, {
  valid: [
    // Single view-model export
    {
      code: `export const selectHomeViewModel = () => ({})`,
      filename: '/project/ui/screens/Home/home.view-model.ts',
    },
    // Single view-model function
    {
      code: `export function selectBlocklistViewModel() { return {} }`,
      filename: '/project/ui/screens/Blocklist/blocklist.view-model.ts',
    },
    // Single named export
    {
      code: `const selectSessionViewModel = () => ({}); export { selectSessionViewModel }`,
      filename: '/project/ui/screens/Session/session.view-model.ts',
    },
    // Non-view-model exports are allowed
    {
      code: `
        export const selectHomeViewModel = () => ({})
        export const helper = () => {}
        export const utils = {}
      `,
      filename: '/project/ui/screens/Home/home.view-model.ts',
    },
    // Not a .view-model.ts file - should not apply
    {
      code: `
        export const selectOneViewModel = () => ({})
        export const selectTwoViewModel = () => ({})
      `,
      filename: '/project/ui/screens/Home/helpers.ts',
    },
    // Test file - should not apply
    {
      code: `
        export const selectOneViewModel = () => ({})
        export const selectTwoViewModel = () => ({})
      `,
      filename: '/project/ui/screens/Home/home.view-model.test.ts',
    },
    // Spec file - should not apply
    {
      code: `
        export const selectOneViewModel = () => ({})
        export const selectTwoViewModel = () => ({})
      `,
      filename: '/project/ui/screens/Home/home.view-model.spec.ts',
    },
    // node_modules - should skip
    {
      code: `
        export const selectOneViewModel = () => ({})
        export const selectTwoViewModel = () => ({})
      `,
      filename: '/project/node_modules/package/home.view-model.ts',
    },
  ],

  invalid: [
    // Two view-models - NOT OK
    {
      code: `
        export const selectHomeViewModel = () => ({})
        export const selectHeaderViewModel = () => ({})
      `,
      filename: '/project/ui/screens/Home/home.view-model.ts',
      errors: [
        {
          messageId: 'multipleViewModels',
          data: {
            filename: 'home.view-model.ts',
            count: 2,
            viewModels: 'selectHomeViewModel, selectHeaderViewModel',
          },
        },
      ],
    },
    // Three view-models - NOT OK
    {
      code: `
        export const selectAViewModel = () => ({})
        export const selectBViewModel = () => ({})
        export const selectCViewModel = () => ({})
      `,
      filename: '/project/ui/screens/Multi/multi.view-model.ts',
      errors: [
        {
          messageId: 'multipleViewModels',
          data: {
            filename: 'multi.view-model.ts',
            count: 3,
            viewModels: 'selectAViewModel, selectBViewModel, selectCViewModel',
          },
        },
      ],
    },
    // Mixed export styles - NOT OK
    {
      code: `
        const selectItemViewModel = () => ({})
        export function selectListViewModel() { return {} }
        export { selectItemViewModel }
      `,
      filename: '/project/ui/screens/List/list.view-model.ts',
      errors: [
        {
          messageId: 'multipleViewModels',
          data: {
            filename: 'list.view-model.ts',
            count: 2,
            viewModels: 'selectListViewModel, selectItemViewModel',
          },
        },
      ],
    },
  ],
})
