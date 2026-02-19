/**
 * @fileoverview Enforce extracting complex JSX from conditional returns into separate components
 * @author TiedSiren
 */

module.exports = {
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
        node.children && node.children.some((child) => child.type === 'JSXElement')

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

    function isComplexJSXOrFragment(node) {
      return (
        (node.type === 'JSXElement' && isComplexJSX(node)) ||
        node.type === 'JSXFragment'
      )
    }

    function findContainingFunction(node) {
      let functionNode = node.parent
      while (
        functionNode &&
        functionNode.type !== 'FunctionDeclaration' &&
        functionNode.type !== 'FunctionExpression' &&
        functionNode.type !== 'ArrowFunctionExpression'
      ) {
        functionNode = functionNode.parent
      }
      return functionNode
    }

    function checkConditionalReturn(node) {
      // Check if this is a return statement
      if (node.type !== 'ReturnStatement') return

      // Check if it's returning JSX
      const returnValue = node.argument
      if (!returnValue) return

      if (!isComplexJSXOrFragment(returnValue)) return

      // Find parent if statement or switch case
      let parent = node.parent
      while (
        parent &&
        parent.type !== 'IfStatement' &&
        parent.type !== 'SwitchCase'
      ) {
        parent = parent.parent
        if (!parent || parent.type === 'FunctionDeclaration') break
      }

      if (
        parent &&
        (parent.type === 'IfStatement' || parent.type === 'SwitchCase')
      ) {
        const functionNode = findContainingFunction(node)
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
      if (node.type !== 'ConditionalExpression') return

      if (isComplexJSXOrFragment(node.consequent)) {
        const functionNode = findContainingFunction(node)
        const suggestedName = generateSuggestedName(node.consequent, functionNode)

        context.report({
          node: node.consequent,
          messageId: 'extractComponent',
          data: { suggestedName },
        })
      }

      if (isComplexJSXOrFragment(node.alternate)) {
        const functionNode = findContainingFunction(node)
        const suggestedName = generateSuggestedName(node.alternate, functionNode)

        context.report({
          node: node.alternate,
          messageId: 'extractComponent',
          data: { suggestedName },
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

    function checkLogicalExpression(node) {
      if (!isComplexJSXOrFragment(node.right)) return

      const functionNode = findContainingFunction(node)
      const suggestedName = generateSuggestedName(node.right, functionNode)

      context.report({
        node: node.right,
        messageId: 'extractComponent',
        data: { suggestedName },
      })
    }

    function getEarlyJSXReturnNodes(statements) {
      const nodes = []
      for (const stmt of statements) {
        if (stmt.type !== 'IfStatement') continue

        const block =
          stmt.consequent.type === 'BlockStatement'
            ? stmt.consequent.body
            : [stmt.consequent]

        for (const s of block) {
          if (
            s.type === 'ReturnStatement' &&
            s.argument &&
            (s.argument.type === 'JSXElement' ||
              s.argument.type === 'JSXFragment')
          )
            nodes.push(s.argument)
        }
      }
      return nodes
    }

    function isComponentFunction(fn) {
      if (fn.id && /^[A-Z]/.test(fn.id.name)) return true

      if (
        fn.parent?.type === 'VariableDeclarator' &&
        fn.parent.id?.type === 'Identifier' &&
        /^[A-Z]/.test(fn.parent.id.name)
      )
        return true

      if (fn.parent?.type === 'ExportDefaultDeclaration') return true

      return false
    }

    function checkImplicitElseReturn(node) {
      if (!node.argument) return

      const returnValue = node.argument
      if (
        returnValue.type !== 'JSXElement' &&
        returnValue.type !== 'JSXFragment'
      )
        return

      const block = node.parent
      if (!block || block.type !== 'BlockStatement') return

      const fn = block.parent
      if (
        !fn ||
        (fn.type !== 'FunctionDeclaration' &&
          fn.type !== 'FunctionExpression' &&
          fn.type !== 'ArrowFunctionExpression')
      )
        return

      // Only flag in component functions (PascalCase), not renderItem callbacks
      if (!isComponentFunction(fn)) return

      const statements = block.body
      const returnIndex = statements.indexOf(node)
      if (returnIndex < 1) return

      const precedingStatements = statements.slice(0, returnIndex)
      const earlyReturnNodes = getEarlyJSXReturnNodes(precedingStatements)
      if (earlyReturnNodes.length === 0) return

      // Only flag when neither branch is complex, so converting to a ternary
      // is a clean fix. Complex branches (loading guards, state machines)
      // would just shift the violation to checkTernaryExpression.
      const isDefaultComplex = isComplexJSXOrFragment(returnValue)
      const hasComplexEarly = earlyReturnNodes.some((n) =>
        isComplexJSXOrFragment(n),
      )
      if (isDefaultComplex || hasComplexEarly) return

      const suggestedName = generateSuggestedName(returnValue, fn)

      context.report({
        node: returnValue,
        messageId: 'extractComponent',
        data: { suggestedName },
      })
    }

    return {
      ReturnStatement(node) {
        checkConditionalReturn(node)
        checkImplicitElseReturn(node)
      },
      ConditionalExpression(node) {
        checkTernaryExpression(node)
      },
      CallExpression(node) {
        checkMapCallback(node)
      },
      LogicalExpression(node) {
        checkLogicalExpression(node)
      },
    }
  },
}
