/**
 * @fileoverview Tests for core-test-file-naming rule
 */

const { RuleTester } = require('eslint')
const rule = require('./core-test-file-naming.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('core-test-file-naming', rule, {
  valid: [
    // Correct selector test naming
    {
      code: `describe('selectUser', () => {})`,
      filename: '/project/core/auth/selectors/selectUser.test.ts',
    },
    // View model test in selectors
    {
      code: `describe('home view model', () => {})`,
      filename: '/project/core/auth/selectors/home.view-model.test.ts',
    },
    // Correct usecase test naming
    {
      code: `describe('login', () => {})`,
      filename: '/project/core/auth/usecases/login.usecase.test.ts',
    },
    // Usecase with spec extension
    {
      code: `describe('login', () => {})`,
      filename: '/project/core/auth/usecases/login.usecase.spec.ts',
    },
    // Correct listener test naming
    {
      code: `describe('on-user-logged-in', () => {})`,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.test.ts',
    },
    // Non-test file - should not apply
    {
      code: `export const something = {}`,
      filename: '/project/core/auth/selectors/selectUser.ts',
    },
    // Test file not in selectors/usecases/listeners - should not apply
    {
      code: `describe('something', () => {})`,
      filename: '/project/core/auth/utils.test.ts',
    },
  ],

  invalid: [
    // Bad selector test name (doesn't start with select)
    {
      code: `describe('user', () => {})`,
      filename: '/project/core/auth/selectors/user.test.ts',
      errors: [{ messageId: 'badSelectorTestName' }],
    },
    // Bad selector test name (generic name)
    {
      code: `describe('tests', () => {})`,
      filename: '/project/core/auth/selectors/tests.test.ts',
      errors: [{ messageId: 'badSelectorTestName' }],
    },
    // Bad usecase test name (missing .usecase.)
    {
      code: `describe('login', () => {})`,
      filename: '/project/core/auth/usecases/login.test.ts',
      errors: [{ messageId: 'badUsecaseTestName' }],
    },
    // Bad listener test name (missing .listener.)
    {
      code: `describe('on-user-logged-in', () => {})`,
      filename: '/project/core/auth/listeners/on-user-logged-in.test.ts',
      errors: [{ messageId: 'badListenerTestName' }],
    },
    // Bad listener test name (generic name)
    {
      code: `describe('auth', () => {})`,
      filename: '/project/core/auth/listeners/auth.test.ts',
      errors: [{ messageId: 'badListenerTestName' }],
    },
  ],
})
