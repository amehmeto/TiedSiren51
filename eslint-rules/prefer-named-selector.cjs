// @ts-check
'use strict'

/**
 * @fileoverview Prefer named selectors over inline state access in useSelector
 * @author TiedSiren
 *
 * Detects:
 *   useSelector((state) => state.toast)
 *   useSelector((s) => s.blockSession)
 *   useSelector((state) => state.auth.authUser?.email)
 *   useSelector((state) => selectFoo(state))
 *   useSelector((state: RootState) => selectFoo(state))
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
    fixable: 'code',
    docs: {
      description:
        'Prefer named selectors over inline state slice access in useSelector',
      recommended: false,
    },
    messages: {
      preferNamedSelector:
        'Use a named selector instead of inline state access. Create a selector like "select{{SliceName}}" in core/{{sliceName}}/selectors/.',
      redundantSelectorWrapper:
        'Redundant wrapper around selector. Use useSelector({{selectorName}}) directly.',
    },
    schema: [],
  },
  create(context) {
    /**
     * @param {import('estree').Node} arg
     * @returns {string | null}
     */
    function getParamName(arg) {
      if (arg.params.length !== 1) return null
      const [param] = arg.params
      return param.type === 'Identifier' ? param.name : null
    }

    /**
     * @param {import('estree').Node} body
     * @returns {import('estree').Node}
     */
    function unwrapBlockBody(body) {
      if (body.type !== 'BlockStatement') return body
      const statements = body.body.filter((s) => s.type !== 'EmptyStatement')
      if (statements.length !== 1) return body
      const [stmt] = statements
      return stmt.type === 'ReturnStatement' && stmt.argument
        ? stmt.argument
        : body
    }

    /**
     * Walk a MemberExpression/ChainExpression chain to find the root
     * identifier and the first property (slice name).
     * Returns null if the chain contains computed access or method calls.
     * @param {import('estree').Node} node
     * @returns {{ rootName: string, sliceName: string } | null}
     */
    function getPropertyChainRoot(node) {
      /** @type {import('estree').Node} */
      let current = node

      // Unwrap ChainExpression (optional chaining wrapper)
      if (current.type === 'ChainExpression') current = current.expression

      if (current.type !== 'MemberExpression') return null
      if (current.computed) return null
      if (current.property.type !== 'Identifier') return null

      // Walk down the chain of MemberExpressions
      let obj = current.object
      // Unwrap ChainExpression in nested positions
      if (obj.type === 'ChainExpression') obj = obj.expression

      if (obj.type === 'Identifier') {
        // Direct: state.slice
        return { rootName: obj.name, sliceName: current.property.name }
      }

      if (obj.type === 'MemberExpression') {
        // Nested: state.slice.something...
        // Recursively find root, but keep the slice name from the first level
        const inner = getPropertyChainRoot(obj)
        if (inner) return inner
      }

      return null
    }

    function checkInlineSliceAccess(body, paramName, arg) {
      const chain = getPropertyChainRoot(body)
      if (!chain) return
      if (chain.rootName !== paramName) return

      const { sliceName } = chain
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
    }

    /**
     * @param {import('estree').Node} body
     * @param {string} paramName
     * @param {import('estree').Node} arg
     */
    function checkRedundantWrapper(body, paramName, arg) {
      if (body.type !== 'CallExpression') return
      if (body.callee.type !== 'Identifier') return
      if (body.arguments.length !== 1) return

      const [callArg] = body.arguments
      if (callArg.type !== 'Identifier' || callArg.name !== paramName) return

      const selectorName = body.callee.name

      context.report({
        node: arg,
        messageId: 'redundantSelectorWrapper',
        data: { selectorName },
        fix(fixer) {
          return fixer.replaceText(arg, selectorName)
        },
      })
    }

    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 'useSelector'
        )
          return

        const [arg] = node.arguments
        if (!arg) return

        if (
          arg.type !== 'ArrowFunctionExpression' &&
          arg.type !== 'FunctionExpression'
        )
          return

        const paramName = getParamName(arg)
        if (!paramName) return

        const body = unwrapBlockBody(arg.body)

        checkInlineSliceAccess(body, paramName, arg)
        checkRedundantWrapper(body, paramName, arg)
      },
    }
  },
}
