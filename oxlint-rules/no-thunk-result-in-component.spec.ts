/**
 * @fileoverview Tests for no-thunk-result-in-component rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './no-thunk-result-in-component.js'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
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
