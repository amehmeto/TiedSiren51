// @ts-check
'use strict'

/**
 * @fileoverview Enforce state as the first parameter in selector functions
 * @author TiedSiren
 *
 * Selectors by definition select from state, so state should always be
 * the first parameter for consistency and convention.
 *
 * Bad:
 *   export const selectFoo = (dateProvider, state, id) => ...
 *   export const selectBar = (id: string, state: RootState) => ...
 *
 * Good:
 *   export const selectFoo = (state, dateProvider, id) => ...
 *   export const selectBar = (state: RootState, id: string) => ...
 */

/**
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce state as the first parameter in selector functions',
      recommended: false,
    },
    messages: {
      stateFirstParam:
        'Selector "{{name}}" should have "state" as its first parameter. Found "{{firstParam}}" instead.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename()

    // Only apply to files in selectors directories
    if (!filename.includes('/selectors/')) {
      return {}
    }

    /**
     * Check if a parameter represents state
     * @param {import('eslint').Rule.Node} param
     * @returns {boolean}
     */
    function isStateParam(param) {
      // Check parameter name
      if (param.type === 'Identifier') {
        return param.name === 'state'
      }

      // Handle TypeScript typed parameters: state: RootState
      if (
        param.type === 'AssignmentPattern' &&
        param.left.type === 'Identifier'
      ) {
        return param.left.name === 'state'
      }

      return false
    }

    /**
     * Get the parameter name for error reporting
     * @param {import('eslint').Rule.Node} param
     * @returns {string}
     */
    function getParamName(param) {
      if (param.type === 'Identifier') {
        return param.name
      }
      if (
        param.type === 'AssignmentPattern' &&
        param.left.type === 'Identifier'
      ) {
        return param.left.name
      }
      return '<unknown>'
    }

    /**
     * Check a function declaration or arrow function
     * @param {import('eslint').Rule.Node} node
     * @param {string} name
     * @param {Array} params
     */
    function checkSelector(node, name, params) {
      // Only check functions starting with "select"
      if (!name || !name.startsWith('select')) {
        return
      }

      // Skip createSelector calls (they use a different pattern)
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'createSelector'
      ) {
        return
      }

      // Must have at least one parameter
      if (!params || params.length === 0) {
        return
      }

      const firstParam = params[0]

      // Check if first param is state
      if (!isStateParam(firstParam)) {
        context.report({
          node: firstParam,
          messageId: 'stateFirstParam',
          data: {
            name,
            firstParam: getParamName(firstParam),
          },
        })
      }
    }

    return {
      // export const selectFoo = (params) => ...
      // export const selectFoo = function(params) { ... }
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier') return
        const name = node.id.name

        if (!name.startsWith('select')) return

        const init = node.init

        // Skip createSelector
        if (
          init &&
          init.type === 'CallExpression' &&
          init.callee.type === 'Identifier' &&
          init.callee.name === 'createSelector'
        ) {
          return
        }

        // Arrow function
        if (init && init.type === 'ArrowFunctionExpression') {
          checkSelector(init, name, init.params)
        }

        // Regular function expression
        if (init && init.type === 'FunctionExpression') {
          checkSelector(init, name, init.params)
        }
      },

      // export function selectFoo(params) { ... }
      FunctionDeclaration(node) {
        if (!node.id || node.id.type !== 'Identifier') return
        const name = node.id.name

        if (!name.startsWith('select')) return

        checkSelector(node, name, node.params)
      },
    }
  },
}
