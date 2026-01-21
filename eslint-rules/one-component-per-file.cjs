/**
 * @fileoverview Enforce one React component per file
 * A component is defined as a function with PascalCase name that returns JSX.
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce one React component per file',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      multipleComponents:
        'File contains multiple components ({{components}}). Extract `{{extra}}` to separate files.',
    },
    schema: [],
  },

  create(context) {
    const components = []

    function isPascalCase(name) {
      return /^[A-Z][a-zA-Z0-9]*$/.test(name)
    }

    function containsJSX(node) {
      let hasJSX = false

      function visit(n) {
        if (!n || typeof n !== 'object') return
        if (hasJSX) return

        if (
          n.type === 'JSXElement' ||
          n.type === 'JSXFragment'
        ) {
          hasJSX = true
          return
        }

        // Check all properties of the node
        for (const key of Object.keys(n)) {
          if (key === 'parent') continue // Skip parent to avoid cycles
          const value = n[key]
          if (Array.isArray(value)) {
            for (const item of value) {
              visit(item)
            }
          } else if (value && typeof value === 'object' && value.type) {
            visit(value)
          }
        }
      }

      visit(node)
      return hasJSX
    }

    function checkFunction(node, name) {
      if (!name || !isPascalCase(name)) return

      // Check if the function body contains JSX
      const body = node.body
      if (!body) return

      if (containsJSX(body)) {
        components.push({
          name,
          node,
        })
      }
    }

    return {
      // Regular function declarations: function MyComponent() {}
      FunctionDeclaration(node) {
        if (node.id && node.id.name) {
          checkFunction(node, node.id.name)
        }
      },

      // Arrow functions and function expressions assigned to variables
      // const MyComponent = () => {} or const MyComponent = function() {}
      VariableDeclarator(node) {
        if (node.id && node.id.type === 'Identifier' && node.init) {
          const init = node.init
          if (
            init.type === 'ArrowFunctionExpression' ||
            init.type === 'FunctionExpression'
          ) {
            checkFunction(init, node.id.name)
          }
        }
      },

      'Program:exit'() {
        if (components.length > 1) {
          const componentNames = components.map((c) => c.name)
          const extraComponents = componentNames.slice(1)

          // Report on each extra component
          for (let i = 1; i < components.length; i++) {
            context.report({
              node: components[i].node,
              messageId: 'multipleComponents',
              data: {
                components: componentNames.join(', '),
                extra: components[i].name,
              },
            })
          }
        }
      },
    }
  },
}
