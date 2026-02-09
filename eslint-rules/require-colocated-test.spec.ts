/**
 * @fileoverview Tests for require-colocated-test rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./require-colocated-test.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('require-colocated-test', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('require-colocated-test', rule, {
      valid: [
        // Test file itself - should not apply
        {
          code: `describe('test', () => {})`,
          filename: '/project/core/auth/usecases/login.usecase.test.ts',
        },
        // Spec file itself - should not apply
        {
          code: `describe('test', () => {})`,
          filename: '/project/core/auth/usecases/login.usecase.spec.ts',
        },
        // Fixture file - should not apply
        {
          code: `export const fixture = {}`,
          filename: '/project/core/auth/usecases/login.fixture.ts',
        },
        // Builder file - should not apply
        {
          code: `export const buildLogin = () => ({})`,
          filename: '/project/core/auth/usecases/login.builder.ts',
        },
        // Mock file - should not apply
        {
          code: `export const mock = {}`,
          filename: '/project/core/auth/usecases/login.mock.ts',
        },
        // Non-matching file type - should not apply
        {
          code: `export const slice = {}`,
          filename: '/project/core/auth/auth.slice.ts',
        },
      ],

      invalid: [
        // Usecase without test - NOT OK
        {
          code: `export const login = () => {}`,
          filename: '/project/core/auth/usecases/login.usecase.ts',
          errors: [
            {
              messageId: 'missingUsecaseTest',
              data: {
                filename: 'login.usecase.ts',
                expected: 'login.usecase.spec.ts',
              },
            },
          ],
        },
        // Listener without test - NOT OK
        {
          code: `export const onUserLoggedInListener = () => {}`,
          filename:
            '/project/core/auth/listeners/on-user-logged-in.listener.ts',
          errors: [
            {
              messageId: 'missingListenerTest',
              data: {
                filename: 'on-user-logged-in.listener.ts',
                expected: 'on-user-logged-in.listener.test.ts',
              },
            },
          ],
        },
        // Selector without test - NOT OK
        {
          code: `export const selectUser = (state) => state.user`,
          filename: '/project/core/auth/selectors/selectUser.ts',
          errors: [
            {
              messageId: 'missingSelectorTest',
              data: {
                filename: 'selectUser.ts',
                expected: 'selectUser.test.ts',
              },
            },
          ],
        },
        // Schema without test - NOT OK
        {
          code: `export const authSchema = {}`,
          filename: '/project/core/auth/auth.schema.ts',
          errors: [
            {
              messageId: 'missingSchemaTest',
              data: {
                filename: 'auth.schema.ts',
                expected: 'auth.schema.test.ts',
              },
            },
          ],
        },
        // View model without test - NOT OK
        {
          code: `export const selectHomeViewModel = () => ({})`,
          filename: '/project/ui/screens/Home/home.view-model.ts',
          errors: [
            {
              messageId: 'missingViewModelTest',
              data: {
                filename: 'home.view-model.ts',
                expected: 'home.view-model.test.ts',
              },
            },
          ],
        },
        // Helper without test - NOT OK
        {
          code: `export const formatDate = (date) => date.toString()`,
          filename: '/project/core/utils/date.helper.ts',
          errors: [
            {
              messageId: 'missingHelperTest',
              data: {
                filename: 'date.helper.ts',
                expected: 'date.helper.test.ts',
              },
            },
          ],
        },
      ],
    })
  })
})
