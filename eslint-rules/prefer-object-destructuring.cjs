/**
 * @fileoverview Enforce destructuring when accessing multiple properties of the same object
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce destructuring when accessing multiple properties of the same object via dot notation',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      preferDestructuring:
        "Object '{{object}}' has multiple property accesses ({{properties}}). Consider destructuring: `const { {{properties}} } = {{object}}`",
    },
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'integer',
            minimum: 2,
            default: 2,
          },
          ignoredObjects: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const threshold = options.threshold ?? 2
    const ignoredObjects = new Set(options.ignoredObjects ?? [])

    // Stack of scopes: each scope tracks object property accesses
    // Map<objectName, { properties: Set<string>, firstNode: ASTNode }>
    const scopeStack = [new Map()]

    function currentScope() {
      return scopeStack[scopeStack.length - 1]
    }

    function enterScope() {
      scopeStack.push(new Map())
    }

    function checkAndExitScope() {
      const scope = scopeStack.pop()
      reportViolations(scope)
    }

    function reportViolations(scope) {
      for (const [objectName, entry] of scope) {
        if (entry.properties.size >= threshold) {
          const properties = [...entry.properties].join(', ')
          context.report({
            node: entry.firstNode,
            messageId: 'preferDestructuring',
            data: { object: objectName, properties },
          })
        }
      }
    }

    return {
      FunctionDeclaration() {
        enterScope()
      },
      'FunctionDeclaration:exit'() {
        checkAndExitScope()
      },
      FunctionExpression() {
        enterScope()
      },
      'FunctionExpression:exit'() {
        checkAndExitScope()
      },
      ArrowFunctionExpression() {
        enterScope()
      },
      'ArrowFunctionExpression:exit'() {
        checkAndExitScope()
      },

      MemberExpression(node) {
        // Only simple identifier.property access (dot notation)
        if (node.object.type !== 'Identifier') return
        if (node.computed) return

        const objectName = node.object.name
        if (ignoredObjects.has(objectName)) return

        // Skip assignment targets (obj.prop = value)
        if (
          node.parent.type === 'AssignmentExpression' &&
          node.parent.left === node
        ) {
          return
        }

        // Skip method calls (obj.method())
        if (
          node.parent.type === 'CallExpression' &&
          node.parent.callee === node
        ) {
          return
        }

        const scope = currentScope()
        if (!scope.has(objectName)) {
          scope.set(objectName, {
            properties: new Set(),
            firstNode: node,
          })
        }

        scope.get(objectName).properties.add(node.property.name)
      },

      'Program:exit'() {
        reportViolations(scopeStack[0])
      },
    }
  },
}
