/**
 * @fileoverview Enforce separation between Act and Assert phases in tests
 * @author TiedSiren
 *
 * This rule enforces that the function being tested should be called and stored
 * in a variable before being passed to expect(). This separates the "Act" phase
 * from the "Assert" phase in the Arrange-Act-Assert pattern.
 *
 * It also enforces that complex expected values (objects, arrays) are extracted
 * to variables in the Arrange phase.
 *
 * Bad:  expect(calculateMilliseconds(input)).toBe(expected)
 * Good: const result = calculateMilliseconds(input)
 *       expect(result).toBe(expected)
 *
 * Bad:  expect(result).toEqual({ days: 0, hours: 0 })
 * Good: const expectedTimeUnits = { days: 0, hours: 0 }
 *       expect(result).toEqual(expectedTimeUnits)
 *
 * Bad:  const expected = { days: 0 }  // Generic name not allowed
 * Good: const expectedDuration = { days: 0 }  // Descriptive name
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce separation between Act and Assert phases in tests (AAA pattern)',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      separateActAssert:
        'Separate the Act phase from Assert. Store the result in a variable before asserting. Example: const result = {{functionName}}(...); expect(result).toBe(...)',
      extractExpectedValue:
        'Extract expected value to a descriptive variable in the Arrange phase. Example: const expectedUser = { ... }; expect(result).toEqual(expectedUser)',
      genericExpectedName:
        'Use a descriptive name instead of just "expected". Example: expectedUser, expectedBlocklist, expectedTimeUnits',
      extractDeepProperty:
        'Extract deep property access to a variable before asserting. Example: const {{propertyName}} = {{expression}}; expect({{propertyName}}).toEqual(...)',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedFunctions: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Function names that are allowed inside expect() (e.g., selectors, getters)',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply to test and fixture files
    if (
      !filename.includes('.test.') &&
      !filename.includes('.spec.') &&
      !filename.includes('.fixture.') &&
      !filename.includes('__tests__')
    ) {
      return {}
    }

    const options = context.options[0] || {}
    const allowedFunctions = options.allowedFunctions || []

    // Default allowed patterns: getters, selectors, property access
    const defaultAllowedPatterns = [
      /^get[A-Z]/, // getState, getValue, etc.
      /^select[A-Z]/, // selectUser, selectItems, etc.
      /^is[A-Z]/, // isActive, isEmpty, etc.
      /^has[A-Z]/, // hasError, hasItems, etc.
      /^can[A-Z]/, // canSubmit, canEdit, etc.
    ]

    function isAllowedFunction(name) {
      if (allowedFunctions.includes(name)) return true
      return defaultAllowedPatterns.some((pattern) => pattern.test(name))
    }

    function getFunctionName(node) {
      if (node.type === 'Identifier') {
        return node.name
      }
      if (node.type === 'MemberExpression') {
        if (node.property.type === 'Identifier') {
          return node.property.name
        }
      }
      return null
    }

    function getMemberExpressionDepth(node) {
      let depth = 0
      let current = node
      while (current.type === 'MemberExpression') {
        depth++
        current = current.object
      }
      return depth
    }

    function getDeepestPropertyName(node) {
      if (node.type === 'MemberExpression' && node.property.type === 'Identifier') {
        return node.property.name
      }
      return null
    }

    function getMemberExpressionString(node) {
      if (node.type === 'Identifier') {
        return node.name
      }
      if (node.type === 'MemberExpression') {
        const objStr = getMemberExpressionString(node.object)
        const propStr = node.property.type === 'Identifier' ? node.property.name : '[...]'
        return `${objStr}.${propStr}`
      }
      return '...'
    }

    function isSimpleExpression(node) {
      // Allow simple identifiers (variables)
      if (node.type === 'Identifier') return true

      // Allow simple member expressions (object.property) - only ONE level deep
      // e.g., allow: result.value, state.timer
      // disallow: state.siren.availableSirens (2 levels)
      if (
        node.type === 'MemberExpression' &&
        node.object.type === 'Identifier' &&
        node.property.type === 'Identifier'
      ) {
        return true
      }

      // Allow literals
      if (node.type === 'Literal') return true

      // Allow template literals
      if (node.type === 'TemplateLiteral') return true

      // Allow unary expressions like !value, -value
      if (node.type === 'UnaryExpression') {
        return isSimpleExpression(node.argument)
      }

      return false
    }

    function isDeepMemberExpression(node) {
      // Check if it's a member expression with depth > 1
      // e.g., state.siren.availableSirens has depth 2
      if (node.type === 'MemberExpression') {
        return getMemberExpressionDepth(node) > 1
      }
      return false
    }

    function isSimpleArrayElement(element) {
      // Allow identifiers (variables)
      if (element.type === 'Identifier') return true
      // Allow literals
      if (element.type === 'Literal') return true
      // Allow spread of identifiers like ...items
      if (element.type === 'SpreadElement' && element.argument.type === 'Identifier') return true
      return false
    }

    function isComplexExpression(node) {
      // Object literals with properties should be extracted
      if (node.type === 'ObjectExpression') {
        // Allow empty objects {}
        if (node.properties.length === 0) return false
        return true
      }

      // Array literals need more nuanced checking
      if (node.type === 'ArrayExpression') {
        // Allow empty arrays []
        if (node.elements.length === 0) return false
        // Allow arrays with only simple elements (identifiers, literals)
        // e.g., [blocklist], [item1, item2], [facebookSiren, instagramSiren]
        if (node.elements.every((el) => el && isSimpleArrayElement(el))) {
          return false
        }
        return true
      }

      // Function calls should be extracted
      if (node.type === 'CallExpression') return true

      // Await expressions should be extracted
      if (node.type === 'AwaitExpression') return true

      return false
    }

    // Matchers that take an expected value argument
    const matchersWithExpectedValue = [
      'toBe',
      'toEqual',
      'toStrictEqual',
      'toMatchObject',
      'toContain',
      'toContainEqual',
      'toHaveProperty',
      'toHaveLength',
      'toBeGreaterThan',
      'toBeGreaterThanOrEqual',
      'toBeLessThan',
      'toBeLessThanOrEqual',
      'toBeCloseTo',
    ]

    return {
      // Check for generic variable names like "expected" or "result"
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier') return

        const varName = node.id.name

        // Check if it's exactly "expected" (not "expectedUser", "expectedBlocklist", etc.)
        if (varName === 'expected') {
          context.report({
            node: node.id,
            messageId: 'genericExpectedName',
          })
        }
      },

      CallExpression(node) {
        // Check if this is an expect() call
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'expect') {
          return
        }

        // Get the first argument to expect()
        const arg = node.arguments[0]
        if (!arg) return

        // If it's a simple expression, allow it
        if (isSimpleExpression(arg)) return

        // Check for deep member expressions (Law of Demeter)
        // e.g., state.siren.availableSirens should be extracted to availableSirens first
        if (isDeepMemberExpression(arg)) {
          context.report({
            node: arg,
            messageId: 'extractDeepProperty',
            data: {
              propertyName: getDeepestPropertyName(arg),
              expression: getMemberExpressionString(arg),
            },
          })
          return
        }

        // Check if it's a function call
        if (arg.type === 'CallExpression') {
          const funcName = getFunctionName(arg.callee)

          // Skip if it's an allowed function
          if (funcName && isAllowedFunction(funcName)) return

          // Skip chained method calls like store.getState().timer
          if (
            arg.callee.type === 'MemberExpression' &&
            arg.callee.object.type === 'CallExpression'
          ) {
            const chainedFuncName = getFunctionName(arg.callee.object.callee)
            if (chainedFuncName && isAllowedFunction(chainedFuncName)) return
          }

          context.report({
            node: arg,
            messageId: 'separateActAssert',
            data: {
              functionName: funcName || 'function',
            },
          })
        }

        // Check for await expressions wrapping function calls
        if (arg.type === 'AwaitExpression' && arg.argument.type === 'CallExpression') {
          const funcName = getFunctionName(arg.argument.callee)

          if (funcName && isAllowedFunction(funcName)) return

          context.report({
            node: arg,
            messageId: 'separateActAssert',
            data: {
              functionName: funcName || 'function',
            },
          })
        }
      },

      // Check matcher arguments like expect(x).toEqual({ ... })
      'CallExpression:exit'(node) {
        // Check if this is a matcher call on expect()
        // Pattern: expect(...).toEqual(...) or expect(...).not.toEqual(...)
        if (node.callee.type !== 'MemberExpression') return

        const matcherName = node.callee.property?.name
        if (!matcherName || !matchersWithExpectedValue.includes(matcherName)) return

        // Walk up to check if this is chained from expect()
        let obj = node.callee.object

        // Handle .not modifier: expect(...).not.toEqual(...)
        if (
          obj.type === 'MemberExpression' &&
          obj.property?.name === 'not'
        ) {
          obj = obj.object
        }

        // Handle .resolves/.rejects modifiers
        if (
          obj.type === 'MemberExpression' &&
          (obj.property?.name === 'resolves' || obj.property?.name === 'rejects')
        ) {
          obj = obj.object
        }

        // Check if it's expect(...)
        if (
          obj.type !== 'CallExpression' ||
          obj.callee.type !== 'Identifier' ||
          obj.callee.name !== 'expect'
        ) {
          return
        }

        // Check the matcher argument
        const matcherArg = node.arguments[0]
        if (!matcherArg) return

        // Report if the expected value is complex (object/array literal)
        if (isComplexExpression(matcherArg)) {
          // Skip expect.any(), expect.anything(), expect.arrayContaining(), etc.
          if (
            matcherArg.type === 'CallExpression' &&
            matcherArg.callee.type === 'MemberExpression' &&
            matcherArg.callee.object?.name === 'expect'
          ) {
            return
          }

          context.report({
            node: matcherArg,
            messageId: 'extractExpectedValue',
          })
        }
      },
    }
  },
}
