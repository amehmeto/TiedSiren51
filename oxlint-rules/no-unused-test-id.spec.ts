/**
 * @fileoverview Tests for no-unused-test-id rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './no-unused-test-id.js'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
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
        // Hardcoded testID in test file - OK (excluded by path)
        {
          code: '<View testID="my-component" />',
          filename: '/project/ui/screens/Home/Home.test.ts',
        },
        // Hardcoded testID in spec file - OK (excluded by path)
        {
          code: '<View testID="my-component" />',
          filename: '/project/ui/screens/Home/Home.spec.ts',
        },
        // Hardcoded testID outside ui/ - OK (not scoped)
        {
          code: '<View testID="my-component" />',
          filename: '/project/core/auth/auth.slice.ts',
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
