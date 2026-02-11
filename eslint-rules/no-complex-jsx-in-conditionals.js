/**
 * @fileoverview Enforce extracting complex JSX from conditional returns into separate components
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce extracting complex JSX from conditional returns into separate components',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      extractComponent:
        'Complex JSX in conditional return should be extracted into a separate component. Consider creating a <{{suggestedName}}> component.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxProps: {
            type: 'integer',
            minimum: 0,
            default: 2,
          },
          allowSimpleElements: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const maxProps = options.maxProps ?? 2
    const allowSimpleElements = options.allowSimpleElements ?? true

    function isComplexJSX(node) {
      if (!node || node.type !== 'JSXElement') return false

      // Check if element has JSX children (nested elements)
      const hasJSXChildren =
        node.children &&
        node.children.some((child) => child.type === 'JSXElement')

      // Check if it's a fragment
      const isFragment =
        node.openingElement.name.type === 'JSXFragment' ||
        (node.openingElement.name.name &&
          node.openingElement.name.name === 'Fragment')

      // Primary complexity indicator: Has nested JSX children
      // This is what we really care about - components with children inside them
      if (hasJSXChildren) return true

      // Secondary: Fragment usually means multiple elements
      if (isFragment) return true

      // For elements without children (leaf nodes), we're more lenient
      // Only flag if there's an extreme number of props (suggesting it should be a component)
      const propsCount = node.openingElement.attributes.length
      const hasExcessiveProps = propsCount > 10 // Very high threshold for leaf nodes

      return hasExcessiveProps
    }

    function getComponentNameFromJSX(jsxNode) {
      if (!jsxNode || jsxNode.type !== 'JSXElement') return 'Component'

      const elementName = jsxNode.openingElement.name

      if (elementName.type === 'JSXIdentifier') return elementName.name

      if (elementName.type === 'JSXMemberExpression')
        return elementName.property.name

      return 'Component'
    }

    function generateSuggestedName(jsxNode, parentFunction) {
      // Try to infer from the component name
      const elementName = getComponentNameFromJSX(jsxNode)

      // Try to infer from parent function name or nearby variable
      if (parentFunction) {
        const functionName =
          parentFunction.id?.name || parentFunction.key?.name || ''

        // Extract meaningful part from function name
        if (functionName) {
          // Handle patterns like "renderLoading" -> "Loading"
          const match = functionName.match(/render(\w+)/i)
          if (match) return match[1]

          // Use function name as-is if it's capitalized
          if (/^[A-Z]/.test(functionName)) return functionName
        }
      }

      // Fallback: capitalize element name or generic
      return elementName === 'Fragment' ? 'Component' : elementName
    }

    function checkConditionalReturn(node) {
      // Check if this is a return statement
      if (node.type !== 'ReturnStatement') return

      // Check if it's returning JSX
      const returnValue = node.argument
      if (!returnValue) return

      // Check if we should report this
      const shouldReport =
        (returnValue.type === 'JSXElement' && isComplexJSX(returnValue)) ||
        returnValue.type === 'JSXFragment'

      if (!shouldReport) return

      // Find parent if statement
      let parent = node.parent
      while (parent && parent.type !== 'IfStatement') {
        parent = parent.parent
        if (!parent || parent.type === 'FunctionDeclaration') break
      }

      if (parent && parent.type === 'IfStatement') {
        // Find the containing function
        let functionNode = node.parent
        while (
          functionNode &&
          functionNode.type !== 'FunctionDeclaration' &&
          functionNode.type !== 'FunctionExpression' &&
          functionNode.type !== 'ArrowFunctionExpression'
        ) {
          functionNode = functionNode.parent
        }

        const suggestedName = generateSuggestedName(returnValue, functionNode)

        context.report({
          node: returnValue,
          messageId: 'extractComponent',
          data: {
            suggestedName,
          },
        })
      }
    }

    function checkTernaryExpression(node) {
      // Check if this is a conditional expression (ternary)
      if (node.type !== 'ConditionalExpression') return

      // Check consequent (the "true" branch)
      if (
        node.consequent.type === 'JSXElement' &&
        isComplexJSX(node.consequent)
      ) {
        // Find the containing function to generate a better name
        let functionNode = node.parent
        while (
          functionNode &&
          functionNode.type !== 'FunctionDeclaration' &&
          functionNode.type !== 'FunctionExpression' &&
          functionNode.type !== 'ArrowFunctionExpression'
        ) {
          functionNode = functionNode.parent
        }

        const suggestedName = generateSuggestedName(
          node.consequent,
          functionNode,
        )

        context.report({
          node: node.consequent,
          messageId: 'extractComponent',
          data: {
            suggestedName,
          },
        })
      }

      // Check alternate (the "false" branch)
      if (
        node.alternate.type === 'JSXElement' &&
        isComplexJSX(node.alternate)
      ) {
        // Find the containing function
        let functionNode = node.parent
        while (
          functionNode &&
          functionNode.type !== 'FunctionDeclaration' &&
          functionNode.type !== 'FunctionExpression' &&
          functionNode.type !== 'ArrowFunctionExpression'
        ) {
          functionNode = functionNode.parent
        }

        const suggestedName = generateSuggestedName(
          node.alternate,
          functionNode,
        )

        context.report({
          node: node.alternate,
          messageId: 'extractComponent',
          data: {
            suggestedName,
          },
        })
      }
    }

    function checkMapCallback(node) {
      // Check if this is a .map() call
      if (node.type !== 'CallExpression') return
      if (node.callee.type !== 'MemberExpression') return
      if (node.callee.property.name !== 'map') return

      // Get the callback function (first argument)
      const callback = node.arguments[0]
      if (!callback) return

      // Check if callback is an arrow function or regular function
      if (
        callback.type !== 'ArrowFunctionExpression' &&
        callback.type !== 'FunctionExpression'
      )
        return

      // Get the body of the callback
      let jsxNode = null

      // Arrow function with implicit return (no braces)
      if (callback.body.type === 'JSXElement') {
        jsxNode = callback.body
      }

      // Arrow function or regular function with explicit return
      if (callback.body.type === 'BlockStatement') {
        // Find return statement
        const returnStatement = callback.body.body.find(
          (stmt) => stmt.type === 'ReturnStatement',
        )
        if (returnStatement?.argument?.type === 'JSXElement') {
          jsxNode = returnStatement.argument
        }
      }

      // Check if the JSX is complex
      if (jsxNode && isComplexJSX(jsxNode)) {
        // Find the containing function for better naming
        let functionNode = node.parent
        while (
          functionNode &&
          functionNode.type !== 'FunctionDeclaration' &&
          functionNode.type !== 'FunctionExpression' &&
          functionNode.type !== 'ArrowFunctionExpression'
        ) {
          functionNode = functionNode.parent
        }

        const suggestedName = generateSuggestedName(jsxNode, functionNode)

        context.report({
          node: jsxNode,
          messageId: 'extractComponent',
          data: {
            suggestedName: `${suggestedName}Item`,
          },
        })
      }
    }

    return {
      ReturnStatement(node) {
        checkConditionalReturn(node)
      },
      ConditionalExpression(node) {
        checkTernaryExpression(node)
      },
      CallExpression(node) {
        checkMapCallback(node)
      },
    }
  },
}
