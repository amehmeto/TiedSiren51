/**
 * @fileoverview Disallow selecting entire Redux state in useSelector
 * @author TiedSiren
 *
 * Catches:
 * - useSelector((s) => s)
 * - useSelector((state) => state)
 * - useSelector((s) => { return s })
 * - useSelector(function(s) { return s })
 * - const fn = (s) => s; useSelector(fn)
 * - useSelector(selectEntireState) where selectEntireState returns RootState
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow selecting entire Redux state in useSelector',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noEntireState:
        'Select specific state slices instead of entire state. Use (s) => s.sliceName instead of (s) => s. Selecting entire state causes unnecessary re-renders.',
    },
    schema: [],
  },

  create(context) {
    // Track variable declarations that are "entire state selectors"
    const entireStateSelectorVars = new Set()

    /**
     * Check if a function returns its first parameter directly
     * Handles: (s) => s, (s) => { return s }, function(s) { return s }
     */
    function isEntireStateSelector(node) {
      if (!node) return false

      // Arrow function with expression body: (s) => s
      if (node.type === 'ArrowFunctionExpression') {
        const param = node.params[0]
        if (!param || param.type !== 'Identifier') return false

        // Expression body: (s) => s
        if (node.body.type === 'Identifier') {
          return node.body.name === param.name
        }

        // Block body: (s) => { return s }
        if (node.body.type === 'BlockStatement') {
          return isBlockReturningParam(node.body, param.name)
        }
      }

      // Function expression: function(s) { return s }
      if (node.type === 'FunctionExpression') {
        const param = node.params[0]
        if (!param || param.type !== 'Identifier') return false

        if (node.body.type === 'BlockStatement') {
          return isBlockReturningParam(node.body, param.name)
        }
      }

      return false
    }

    /**
     * Check if a block statement only contains a return of the given param name
     */
    function isBlockReturningParam(block, paramName) {
      const statements = block.body

      // Filter out empty statements
      const meaningfulStatements = statements.filter(
        (s) => s.type !== 'EmptyStatement',
      )

      if (meaningfulStatements.length !== 1) return false

      const stmt = meaningfulStatements[0]
      if (stmt.type !== 'ReturnStatement') return false
      if (!stmt.argument) return false

      return (
        stmt.argument.type === 'Identifier' && stmt.argument.name === paramName
      )
    }

    /**
     * Find variable definition in current scope
     */
    function findVariableDefinition(scope, name) {
      let currentScope = scope

      while (currentScope) {
        const variable = currentScope.variables.find((v) => v.name === name)

        if (variable && variable.defs.length > 0) {
          const def = variable.defs[0]
          if (def.node && def.node.init) {
            return def.node.init
          }
        }

        currentScope = currentScope.upper
      }

      return null
    }

    return {
      // Track variable declarations of entire state selectors
      VariableDeclarator(node) {
        if (
          node.id.type === 'Identifier' &&
          node.init &&
          isEntireStateSelector(node.init)
        ) {
          entireStateSelectorVars.add(node.id.name)
        }
      },

      // Check useSelector calls
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

        // Case 1: Inline function - useSelector((s) => s)
        if (
          arg.type === 'ArrowFunctionExpression' ||
          arg.type === 'FunctionExpression'
        ) {
          if (isEntireStateSelector(arg)) {
            context.report({
              node: arg,
              messageId: 'noEntireState',
            })
          }
          return
        }

        // Case 2: Variable reference - useSelector(fn)
        if (arg.type === 'Identifier') {
          // Check if we tracked this variable as an entire state selector
          if (entireStateSelectorVars.has(arg.name)) {
            context.report({
              node: arg,
              messageId: 'noEntireState',
            })
            return
          }

          // Also check via scope analysis (for variables declared before tracking started)
          const scope = context.sourceCode
            ? context.sourceCode.getScope(node)
            : context.getScope()
          const definition = findVariableDefinition(scope, arg.name)

          if (definition && isEntireStateSelector(definition)) {
            context.report({
              node: arg,
              messageId: 'noEntireState',
            })
          }
        }
      },
    }
  },
}
