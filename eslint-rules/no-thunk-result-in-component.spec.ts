/**
 * @fileoverview Tests for no-thunk-result-in-component rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-thunk-result-in-component.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('no-thunk-result-in-component', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-thunk-result-in-component', rule, {
      valid: [
        // Just dispatching — no result check
        {
          code: `dispatch(reauthenticateWithGoogle())`,
          filename: 'GoogleReauthForm.tsx',
        },
        // Using .match() on something other than fulfilled/rejected
        {
          code: `someRegex.match(value)`,
          filename: 'Component.tsx',
        },
        // fulfilled.match in a non-component file (e.g., test)
        {
          code: `reauthenticateWithGoogle.fulfilled.match(action)`,
          filename: 'Component.spec.tsx',
        },
        // fulfilled.match in a .ts file (non-component)
        {
          code: `reauthenticateWithGoogle.fulfilled.match(action)`,
          filename: 'some-listener.ts',
        },
      ],

      invalid: [
        // fulfilled.match in a component
        {
          code: `
            async function handleConfirm() {
              const action = await dispatch(reauthenticateWithGoogle())
              if (reauthenticateWithGoogle.fulfilled.match(action)) onSuccess()
            }
          `,
          filename: 'GoogleReauthForm.tsx',
          errors: [
            {
              messageId: 'noThunkResult',
              data: { status: 'fulfilled' },
            },
          ],
        },
        // rejected.match in a component
        {
          code: `
            async function handleConfirm() {
              const action = await dispatch(reauthenticate({ password }))
              if (reauthenticate.rejected.match(action)) showError()
            }
          `,
          filename: 'PasswordReauthForm.tsx',
          errors: [
            {
              messageId: 'noThunkResult',
              data: { status: 'rejected' },
            },
          ],
        },
      ],
    })
  })
})
