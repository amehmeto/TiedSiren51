// @ts-check
'use strict'

/**
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow wrapping selectors with useCallback when used with useSelector',
      recommended: false,
    },
    messages: {
      unnecessaryWrapper:
        'Unnecessary useCallback wrapper around selector. Pass the selector directly to useSelector as an inline function instead.',
    },
    schema: [],
  },
  create(context) {
    // Track variables assigned from useCallback with empty deps
    const useCallbackWithEmptyDeps = new Map()

    return {
      // Detect: const selectX = useCallback((state) => ..., [])
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'CallExpression' &&
          node.init.callee.type === 'Identifier' &&
          node.init.callee.name === 'useCallback' &&
          node.init.arguments.length >= 2
        ) {
          const depsArg = node.init.arguments[1]

          // Check if deps array is empty []
          const isEmptyDeps =
            depsArg.type === 'ArrayExpression' && depsArg.elements.length === 0

          if (isEmptyDeps && node.id.type === 'Identifier') {
            // Check if the callback takes a single parameter (likely state)
            const callbackArg = node.init.arguments[0]
            if (
              callbackArg.type === 'ArrowFunctionExpression' ||
              callbackArg.type === 'FunctionExpression'
            ) {
              const params = callbackArg.params
              // Selector pattern: single param, often named 'state' or typed as RootState
              if (params.length === 1) {
                useCallbackWithEmptyDeps.set(node.id.name, node.init)
              }
            }
          }
        }
      },

      // Detect: useSelector(selectX) where selectX was from useCallback
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useSelector' &&
          node.arguments.length >= 1
        ) {
          const selectorArg = node.arguments[0]

          if (
            selectorArg.type === 'Identifier' &&
            useCallbackWithEmptyDeps.has(selectorArg.name)
          ) {
            const useCallbackNode = useCallbackWithEmptyDeps.get(
              selectorArg.name,
            )
            context.report({
              node: useCallbackNode,
              messageId: 'unnecessaryWrapper',
            })
          }
        }
      },
    }
  },
}
