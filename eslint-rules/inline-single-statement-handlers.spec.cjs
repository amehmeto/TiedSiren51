/**
 * @fileoverview Tests for inline-single-statement-handlers rule
 */

const { RuleTester } = require('eslint')
const rule = require('./inline-single-statement-handlers.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

ruleTester.run('inline-single-statement-handlers', rule, {
  valid: [
    // Multi-statement handler - should NOT report
    {
      code: `
        const handleClick = () => {
          doSomething()
          doSomethingElse()
        }
      `,
      filename: 'Component.tsx',
    },
    // Handler with conditional logic - single if statement counts as 1 statement
    // but has non-trivial logic, so we keep it in valid for documentation
    // Actually, the rule DOES report this - move to invalid section if needed
    // For now, use a more complex conditional that has multiple statements
    {
      code: `
        const handleSubmit = () => {
          if (isValid) {
            submit()
          }
          cleanup()
        }
      `,
      filename: 'Component.tsx',
    },
    // Non-handler function - should NOT report
    {
      code: `
        const doSomething = () => {
          callApi()
        }
      `,
      filename: 'Component.tsx',
    },
    // Implicit return (concise body) - should NOT report
    {
      code: `const handleClick = () => doSomething()`,
      filename: 'Component.tsx',
    },
    // Non-tsx file - should NOT report
    {
      code: `
        const handleClick = () => {
          doSomething()
        }
      `,
      filename: 'utils.ts',
    },
    // Test file - should NOT report
    {
      code: `
        const handleClick = () => {
          doSomething()
        }
      `,
      filename: 'Component.spec.tsx',
    },
    // Empty handler - should NOT report
    {
      code: `const handleClick = () => {}`,
      filename: 'Component.tsx',
    },
  ],

  invalid: [
    // Single-statement handle* handler - SHOULD report
    {
      code: `
        const handleClick = () => {
          doSomething()
        }
      `,
      filename: 'Component.tsx',
      errors: [{ messageId: 'shouldInline', data: { name: 'handleClick' } }],
    },
    // Single-statement on* handler - SHOULD report
    {
      code: `
        const onClick = () => {
          doSomething()
        }
      `,
      filename: 'Component.tsx',
      errors: [{ messageId: 'shouldInline', data: { name: 'onClick' } }],
    },
    // Single return statement - SHOULD report
    {
      code: `
        const handleChange = () => {
          return getValue()
        }
      `,
      filename: 'Component.tsx',
      errors: [{ messageId: 'shouldInline', data: { name: 'handleChange' } }],
    },
  ],
})
