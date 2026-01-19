/**
 * @fileoverview Tests for prefer-inline-variable rule
 */

const { RuleTester } = require('eslint')
const rule = require('./prefer-inline-variable.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
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
    // Deeply nested in JSX with siblings before - should NOT report
    {
      code: `
        function Component() {
          const selectedItems = selectItemsFrom(list)
          return (
            <>
              <Text>Label</Text>
              <Text>{selectedItems}</Text>
            </>
          )
        }
      `,
    },
    // Nested in JSX element with sibling before - should NOT report
    {
      code: `
        function Component() {
          const count = getCount()
          return (
            <View>
              <Text>Items:</Text>
              <Text>{count}</Text>
            </View>
          )
        }
      `,
    },
    // Descriptive name for array literal - should NOT report (semantic labeling)
    {
      code: `
        const deviceTypes = ['android', 'ios', 'web']
        const type = faker.helpers.arrayElement(deviceTypes)
      `,
    },
    // Descriptive name for array with multiple items - should NOT report
    {
      code: `
        const deviceNames = ['Huawei P30', 'Google Pixel 3a', 'MacBook Pro']
        const name = faker.helpers.arrayElement(deviceNames)
      `,
    },
    // Descriptive name for object literal - should NOT report
    {
      code: `
        const defaultConfig = { timeout: 5000, retries: 3 }
        initializeWith(defaultConfig)
      `,
    },
    // Descriptive name for validation rules - should NOT report
    {
      code: `
        const validationRules = ['required', 'email', 'min:3']
        applyRules(validationRules)
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
    // Non-descriptive array name - SHOULD report and fix
    {
      code: `const arr = [1, 2, 3]
console.log(arr)`,
      errors: [{ messageId: 'preferInline', data: { name: 'arr' } }],
      output: `
console.log([1, 2, 3])`,
    },
    // Non-descriptive object name - SHOULD report and fix
    {
      code: `const obj = { a: 1, b: 2 }
doSomething(obj)`,
      errors: [{ messageId: 'preferInline', data: { name: 'obj' } }],
      output: `
doSomething({ a: 1, b: 2 })`,
    },
    // Generic 'data' name for array - SHOULD report and fix
    {
      code: `const data = ['a', 'b', 'c']
process(data)`,
      errors: [{ messageId: 'preferInline', data: { name: 'data' } }],
      output: `
process(['a', 'b', 'c'])`,
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
    // Direct JSX prop (not deeply nested, no siblings) - SHOULD inline
    {
      code: `function Component() {
  const items = getItems()
  return <List data={items} />
}`,
      errors: [{ messageId: 'preferInline', data: { name: 'items' } }],
      output: `function Component() {
  
  return <List data={getItems()} />
}`,
    },
  ],
})
