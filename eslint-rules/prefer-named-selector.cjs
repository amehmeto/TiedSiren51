// @ts-check
'use strict'

/**
 * @fileoverview Prefer named selectors over inline state access in useSelector
 * @author TiedSiren
 *
 * Detects:
 *   useSelector((state) => state.toast)
 *   useSelector((s) => s.blockSession)
 *
 * Allows:
 *   useSelector(selectToast)
 *   useSelector((state) => selectSomething(state, dep))
 *   useSelector((state) => state.items.filter(...))
 */

/**
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer named selectors over inline state slice access in useSelector',
      recommended: false,
    },
    messages: {
      preferNamedSelector:
        'Use a named selector instead of inline state access. Create a selector like "select{{SliceName}}" in core/{{sliceName}}/selectors/.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Must be useSelector call
        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 'useSelector'
        ) {
          return
        }

        const arg = node.arguments[0]
        if (!arg) return

        // Check for inline arrow function or function expression
        if (
          arg.type !== 'ArrowFunctionExpression' &&
          arg.type !== 'FunctionExpression'
        ) {
          return
        }

        // Must have exactly one parameter
        if (arg.params.length !== 1) return
        const param = arg.params[0]
        if (param.type !== 'Identifier') return
        const paramName = param.name

        // Get the function body
        let body = arg.body

        // Handle block body: (state) => { return state.foo }
        if (body.type === 'BlockStatement') {
          const statements = body.body.filter((s) => s.type !== 'EmptyStatement')
          if (statements.length !== 1) return
          const stmt = statements[0]
          if (stmt.type !== 'ReturnStatement' || !stmt.argument) return
          body = stmt.argument
        }

        // Check if body is simple member expression: state.sliceName
        if (body.type !== 'MemberExpression') return

        // Must be state.something (not state.foo.bar or state['foo'])
        if (body.object.type !== 'Identifier') return
        if (body.object.name !== paramName) return
        if (body.computed) return // state['foo'] is computed
        if (body.property.type !== 'Identifier') return

        // This is the pattern: (state) => state.sliceName
        const sliceName = body.property.name
        const capitalizedSliceName =
          sliceName.charAt(0).toUpperCase() + sliceName.slice(1)

        context.report({
          node: arg,
          messageId: 'preferNamedSelector',
          data: {
            sliceName,
            SliceName: capitalizedSliceName,
          },
        })
      },
    }
  },
}
