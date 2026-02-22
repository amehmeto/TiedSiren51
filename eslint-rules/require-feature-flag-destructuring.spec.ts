/**
 * @fileoverview Tests for require-feature-flag-destructuring rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./require-feature-flag-destructuring.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('require-feature-flag-destructuring', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('require-feature-flag-destructuring', rule, {
      valid: [
        {
          code: `const { MULTI_DEVICE: isMultiDevice } = useSelector(selectFeatureFlags)`,
        },
        {
          code: `const { MULTI_DEVICE: isMultiDevice, BLOCKING_CONDITIONS: isBlockingConditions } = useSelector(selectFeatureFlags)`,
        },
        {
          code: `const user = useSelector(selectUser)`,
        },
        {
          code: `const viewModel = useSelector(selectLoginViewModel)`,
        },
        {
          code: `const flags = getFlags()`,
        },
        {
          code: `function Comp() { const featureFlags = useSelector(selectFeatureFlags); const { MULTI_DEVICE: isMultiDevice } = featureFlags; doSomething(featureFlags) }`,
        },
        {
          code: `function Comp() { const featureFlags = useSelector(selectFeatureFlags); someFunc(featureFlags) }`,
        },
      ],

      invalid: [
        {
          code: `function Comp() { const featureFlags = useSelector(selectFeatureFlags); return featureFlags.APPLE_SIGN_IN }`,
          output: `function Comp() { const { APPLE_SIGN_IN: isAppleSignIn } = useSelector(selectFeatureFlags); return isAppleSignIn }`,
          errors: [
            {
              messageId: 'requireDestructuring',
              data: { name: 'featureFlags' },
            },
          ],
        },
        {
          code: `function Comp() { const flags = useSelector(selectFeatureFlags); return flags.MULTI_DEVICE && flags.BLOCKING_CONDITIONS }`,
          output: `function Comp() { const { MULTI_DEVICE: isMultiDevice, BLOCKING_CONDITIONS: isBlockingConditions } = useSelector(selectFeatureFlags); return isMultiDevice && isBlockingConditions }`,
          errors: [
            {
              messageId: 'requireDestructuring',
              data: { name: 'flags' },
            },
          ],
        },
      ],
    })
  })
})
