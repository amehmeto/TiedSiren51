/**
 * @fileoverview Tests for one-usecase-per-file rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./one-usecase-per-file.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('one-usecase-per-file', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('one-usecase-per-file', rule, {
      valid: [
        // Single usecase export
        {
          code: `export const startSession = createAppAsyncThunk('session/start', async () => {})`,
          filename: '/project/core/session/usecases/startSession.usecase.ts',
        },
        // Single usecase function
        {
          code: `export function loadBlocklists() { return {} }`,
          filename:
            '/project/core/blocklist/usecases/loadBlocklists.usecase.ts',
        },
        // Single named export
        {
          code: `const createSiren = () => {}; export { createSiren }`,
          filename: '/project/core/siren/usecases/createSiren.usecase.ts',
        },
        // Type exports are allowed alongside usecase
        {
          code: `
        export const startSession = () => {}
        export type StartSessionPayload = {}
        export type StartSessionResult = {}
        export type StartSessionResponse = {}
        export type StartSessionRequest = {}
      `,
          filename: '/project/core/session/usecases/startSession.usecase.ts',
        },
        // Not in usecases folder - should not apply
        {
          code: `
        export const usecaseOne = () => {}
        export const usecaseTwo = () => {}
      `,
          filename: '/project/core/auth/utils.ts',
        },
      ],

      invalid: [
        // Two usecases - NOT OK
        {
          code: `
        export const startSession = () => {}
        export const stopSession = () => {}
      `,
          filename: '/project/core/session/usecases/session.usecase.ts',
          errors: [
            {
              messageId: 'multipleUseCases',
              data: {
                count: 2,
                useCases: 'startSession, stopSession',
              },
            },
          ],
        },
        // Three usecases - NOT OK
        {
          code: `
        export const createUser = () => {}
        export const updateUser = () => {}
        export const deleteUser = () => {}
      `,
          filename: '/project/core/auth/usecases/user.usecase.ts',
          errors: [
            {
              messageId: 'multipleUseCases',
              data: {
                count: 3,
                useCases: 'createUser, updateUser, deleteUser',
              },
            },
          ],
        },
        // Mixed export styles - NOT OK
        {
          code: `
        const removeItem = () => {}
        export const addItem = () => {}
        export { removeItem }
      `,
          filename: '/project/core/cart/usecases/items.usecase.ts',
          errors: [
            {
              messageId: 'multipleUseCases',
              data: {
                count: 2,
                useCases: 'addItem, removeItem',
              },
            },
          ],
        },
      ],
    })
  })
})
