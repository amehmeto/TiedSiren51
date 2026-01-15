/**
 * @fileoverview Tests for prefer-inline-variable rule
 */

const { RuleTester } = require('eslint')
const rule = require('./prefer-inline-variable.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('prefer-inline-variable', rule, {
  valid: [
    // Variable used multiple times - should NOT report
    {
      code: `
        const x = getValue()
        console.log(x)
        console.log(x)
      `,
    },
    // Variable not used - should NOT report (handled by no-unused-vars)
    {
      code: `
        const x = getValue()
      `,
    },
    // Variable used in non-immediate statement - should NOT report
    {
      code: `
        const x = getValue()
        doSomething()
        console.log(x)
      `,
    },
    // Destructuring declaration - should NOT report
    {
      code: `
        const { x } = getValue()
        console.log(x)
      `,
    },
    // Multiple declarations - should NOT report
    {
      code: `
        const x = 1, y = 2
        console.log(x)
      `,
    },
    // Variable with type annotation - should NOT report
    {
      code: `
        const x: string = getValue()
        console.log(x)
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
    // Used in a loop - should NOT report (could change semantics)
    {
      code: `
        const x = getValue()
        for (const item of items) {
          console.log(x)
        }
      `,
    },
    // Would create nested call - should NOT report (JetBrains heuristic)
    {
      code: `
        const session = buildSession()
        withSessions([session])
      `,
    },
    // Would create nested call in object property - should NOT report
    {
      code: `
        const item = createItem()
        const result = process({ items: [item] })
      `,
    },
    // Would create chained method call - should NOT report (JetBrains heuristic)
    {
      code: `
        const result = getData()
        result.toString()
      `,
    },
    // Would create chained property access - should NOT report
    {
      code: `
        const sessions = getSessions()
        const hasSessions = sessions.length > 0
      `,
    },
    // Multi-line initialization - should NOT report (hurts readability)
    {
      code: `
        const sirens = mergeSirens(
          session.blocklists.map((bl) => bl.sirens),
        )
        console.log(sirens)
      `,
    },
    // Multi-line call chain - should NOT report
    {
      code: `
        const result = items
          .filter((x) => x.active)
          .map((x) => x.id)
        console.log(result)
      `,
    },
    // Descriptive name for numeric literal - should NOT report (JetBrains heuristic)
    {
      code: `
        const minWidth = 160
        const bound = Math.max(other, minWidth)
      `,
    },
    // Descriptive name for string literal - should NOT report
    {
      code: `
        const errorMessage = 'Something went wrong'
        throw new Error(errorMessage)
      `,
    },
    // Descriptive name for timeout - should NOT report
    {
      code: `
        const timeout = 5000
        setTimeout(fn, timeout)
      `,
    },
    // Descriptive name for call result - should NOT report (semantic labeling)
    {
      code: `
        const field = error.path.join('.')
        validationErrors[field] = error.message
      `,
    },
    // Descriptive name for call result - should NOT report
    {
      code: `
        const userId = getUserId()
        console.log(userId)
      `,
    },
  ],

  invalid: [
    // Destructuring usage - SHOULD report and fix
    {
      code: `const schedule = getSchedule()
const [first] = schedule`,
      errors: [{ messageId: 'preferInline', data: { name: 'schedule' } }],
      output: `
const [first] = getSchedule()`,
    },
    // Identifier init - SHOULD report and fix
    {
      code: `const x = y
console.log(x)`,
      errors: [{ messageId: 'preferInline', data: { name: 'x' } }],
      output: `
console.log(y)`,
    },
    // Array literal (not a call) - SHOULD report and fix
    {
      code: `const arr = [1, 2, 3]
console.log(arr)`,
      errors: [{ messageId: 'preferInline', data: { name: 'arr' } }],
      output: `
console.log([1, 2, 3])`,
    },
    // Short name (2 chars) for literal - SHOULD inline
    {
      code: `const ms = 1000
setTimeout(fn, ms)`,
      errors: [{ messageId: 'preferInline', data: { name: 'ms' } }],
      output: `
setTimeout(fn, 1000)`,
    },
    // Non-descriptive name for literal - SHOULD inline
    {
      code: `const val = 42
console.log(val)`,
      errors: [{ messageId: 'preferInline', data: { name: 'val' } }],
      output: `
console.log(42)`,
    },
  ],
})
