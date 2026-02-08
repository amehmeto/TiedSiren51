/**
 * @fileoverview Tests for no-stylesheet-magic-numbers rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-stylesheet-magic-numbers.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-stylesheet-magic-numbers', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-stylesheet-magic-numbers', rule, {
      valid: [
        // Using theme constants - OK
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            padding: T.spacing.medium,
            borderRadius: T.radius.small,
          }
        })
      `,
        },
        // Non-restricted properties with numbers - OK
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            flex: 1,
            opacity: 0.5,
            zIndex: 10,
          }
        })
      `,
        },
        // String values - OK
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            width: '100%',
            height: 'auto',
          }
        })
      `,
        },
        // Not StyleSheet.create - OK
        {
          code: `
        const obj = {
          container: {
            padding: 16,
          }
        }
      `,
        },
        // Variables - OK
        {
          code: `
        const padding = 16
        const styles = StyleSheet.create({
          container: {
            padding: padding,
          }
        })
      `,
        },
        // Nested object with non-restricted property - OK
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            shadowOffset: {
              width: T.spacing.small,
              height: T.spacing.small,
            },
          }
        })
      `,
        },
        // Spread element in style object - OK
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            ...baseStyles,
            flex: 1,
          }
        })
      `,
        },
        // Computed property key - OK
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            ['flex']: 1,
          }
        })
      `,
        },
        // No arguments to StyleSheet.create - OK
        {
          code: `StyleSheet.create()`,
        },
        // Non-object argument to StyleSheet.create - OK
        {
          code: `StyleSheet.create(someVariable)`,
        },
        // Style property with non-object value - OK
        {
          code: `
        const styles = StyleSheet.create({
          container: someStyleObject,
        })
      `,
        },
      ],

      invalid: [
        // Magic number in padding
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            padding: 16,
          }
        })
      `,
          errors: [
            {
              messageId: 'noMagicNumber',
              data: { value: 16, property: 'padding' },
            },
          ],
        },
        // Magic number in margin
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            marginTop: 8,
          }
        })
      `,
          errors: [
            {
              messageId: 'noMagicNumber',
              data: { value: 8, property: 'marginTop' },
            },
          ],
        },
        // Magic number in borderRadius
        {
          code: `
        const styles = StyleSheet.create({
          button: {
            borderRadius: 4,
          }
        })
      `,
          errors: [
            {
              messageId: 'noMagicNumber',
              data: { value: 4, property: 'borderRadius' },
            },
          ],
        },
        // Multiple magic numbers
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            padding: 16,
            margin: 8,
            borderRadius: 4,
          }
        })
      `,
          errors: [
            {
              messageId: 'noMagicNumber',
              data: { value: 16, property: 'padding' },
            },
            {
              messageId: 'noMagicNumber',
              data: { value: 8, property: 'margin' },
            },
            {
              messageId: 'noMagicNumber',
              data: { value: 4, property: 'borderRadius' },
            },
          ],
        },
        // Negative number
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            marginTop: -10,
          }
        })
      `,
          errors: [
            {
              messageId: 'noMagicNumber',
              data: { value: -10, property: 'marginTop' },
            },
          ],
        },
        // fontSize magic number
        {
          code: `
        const styles = StyleSheet.create({
          text: {
            fontSize: 14,
          }
        })
      `,
          errors: [
            {
              messageId: 'noMagicNumber',
              data: { value: 14, property: 'fontSize' },
            },
          ],
        },
        // width and height
        {
          code: `
        const styles = StyleSheet.create({
          box: {
            width: 100,
            height: 50,
          }
        })
      `,
          errors: [
            {
              messageId: 'noMagicNumber',
              data: { value: 100, property: 'width' },
            },
            {
              messageId: 'noMagicNumber',
              data: { value: 50, property: 'height' },
            },
          ],
        },
        // Nested object with magic number - shadowOffset
        {
          code: `
        const styles = StyleSheet.create({
          container: {
            shadowOffset: {
              width: 10,
              height: 5,
            },
          }
        })
      `,
          errors: [
            {
              messageId: 'noMagicNumber',
              data: { value: 10, property: 'width' },
            },
            {
              messageId: 'noMagicNumber',
              data: { value: 5, property: 'height' },
            },
          ],
        },
        // Computed property key with magic number
        {
          code: `
        const styles = StyleSheet.create({
          box: {
            ['padding']: 16,
          }
        })
      `,
          errors: [
            {
              messageId: 'noMagicNumber',
              data: { value: 16, property: 'padding' },
            },
          ],
        },
      ],
    })
  })
})
