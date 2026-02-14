/**
 * @fileoverview Tests for no-unused-test-id rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-unused-test-id.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('no-unused-test-id', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-unused-test-id', rule, {
      valid: [
        // testID from props variable - should NOT report
        {
          code: '<View testID={testID} />',
        },
        // testID from template literal with variable - should NOT report
        {
          code: '<View testID={`${baseTestId}-name`} />',
        },
        // No testID at all - should NOT report
        {
          code: '<View style={styles.container} />',
        },
        // Other props with string literals - should NOT report
        {
          code: '<Text accessibilityLabel="some-label" />',
        },
      ],

      invalid: [
        // Hardcoded string literal testID - SHOULD report
        {
          code: '<View testID="my-component" />',
          errors: [
            {
              messageId: 'noHardcodedTestId',
              data: { value: 'my-component' },
            },
          ],
        },
        // Hardcoded testID on input component - SHOULD report
        {
          code: '<TextInput testID="reauth-password-input" />',
          errors: [
            {
              messageId: 'noHardcodedTestId',
              data: { value: 'reauth-password-input' },
            },
          ],
        },
      ],
    })
  })
})
