/**
 * @fileoverview Tests for no-call-expression-in-jsx-props rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-call-expression-in-jsx-props.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('no-call-expression-in-jsx-props', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-call-expression-in-jsx-props', rule, {
      valid: [
        // Simple identifier - VALID
        {
          code: '<Button disabled={isDisabled} />',
        },
        // Member expression - VALID
        {
          code: '<Text style={styles.text} />',
        },
        // Function reference (no call) - VALID
        {
          code: '<Button onPress={handlePress} />',
        },
        // Arrow function (event handler pattern) - VALID
        {
          code: '<Button onPress={() => handlePress(id)} />',
        },
        // Call without arguments (default allowed) - VALID
        {
          code: '<Text>{getValue()}</Text>',
        },
        // Call without arguments in prop - VALID by default
        {
          code: '<Component value={getValue()} />',
        },
        // Whitelisted function (i18n) - VALID
        {
          code: '<Text>{t("hello")}</Text>',
        },
        // Whitelisted function in prop - VALID
        {
          code: '<Button text={t("submit")} />',
        },
        // Logical expression - VALID
        {
          code: '<Button disabled={isLoading || hasError} />',
        },
        // Ternary expression - VALID
        {
          code: '<Text style={isActive ? styles.active : styles.inactive} />',
        },
        // Array expression - VALID
        {
          code: '<List data={[1, 2, 3]} />',
        },
        // Object expression - VALID
        {
          code: '<View style={{ flex: 1 }} />',
        },
        // Template literal - VALID
        {
          code: '<Text>{`Hello ${name}`}</Text>',
        },
        // Negation - VALID
        {
          code: '<Button disabled={!isEnabled} />',
        },
      ],

      invalid: [
        // Call with arguments in prop - INVALID
        {
          code: '<Switch isSelected={isSirenSelected(SirenType.ANDROID, item.packageName)} />',
          errors: [
            {
              messageId: 'extractCallExpression',
              data: { call: 'isSirenSelected(...)', prop: 'isSelected' },
            },
          ],
        },
        // Method call with arguments - INVALID
        {
          code: '<Button style={styles.getStyle(theme)} />',
          errors: [
            {
              messageId: 'extractCallExpression',
              data: { call: 'getStyle(...)', prop: 'style' },
            },
          ],
        },
        // Multiple props with calls - INVALID (both)
        {
          code: '<Component a={fn1(x)} b={fn2(y)} />',
          errors: [
            {
              messageId: 'extractCallExpression',
              data: { call: 'fn1(...)', prop: 'a' },
            },
            {
              messageId: 'extractCallExpression',
              data: { call: 'fn2(...)', prop: 'b' },
            },
          ],
        },
        // Call without arguments when option disabled - INVALID
        {
          code: '<Component value={getValue()} />',
          options: [{ allowNoArguments: false }],
          errors: [
            {
              messageId: 'extractCallExpression',
              data: { call: 'getValue()', prop: 'value' },
            },
          ],
        },
      ],
    })
  })
})
