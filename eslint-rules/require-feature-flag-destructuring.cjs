/**
 * @fileoverview Enforce destructuring when using selectFeatureFlags selector
 * @author TiedSiren
 */

function toCamelCaseWithIsPrefix(upperSnakeCase) {
  const parts = upperSnakeCase.toLowerCase().split('_')
  const camelCase = parts
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('')
  return 'is' + camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Enforce destructuring the result of useSelector(selectFeatureFlags) instead of assigning to a variable',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      requireDestructuring:
        'Destructure feature flags instead of assigning to a variable. Use `const { FLAG_NAME: isFlagName } = useSelector(selectFeatureFlags)` instead of `const {{name}} = useSelector(selectFeatureFlags)`.',
    },
    schema: [],
  },

  create(context) {
    const pendingNodes = []

    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier') return
        if (!node.init) return
        if (node.init.type !== 'CallExpression') return

        const { callee } = node.init
        if (callee.type !== 'Identifier') return
        if (callee.name !== 'useSelector') return

        const [firstArg] = node.init.arguments
        if (!firstArg) return
        if (firstArg.type !== 'Identifier') return
        if (firstArg.name !== 'selectFeatureFlags') return

        pendingNodes.push(node)
      },

      'Program:exit'() {
        const sourceCode = context.getSourceCode()

        for (const node of pendingNodes) {
          const variableName = node.id.name
          const scope = sourceCode.getScope(node)
          const variable = scope.variables.find(
            (v) => v.name === variableName,
          )

          const propertyMap = new Map()
          let hasWholeObjectUsage = false

          if (variable) {
            for (const ref of variable.references) {
              if (ref.isWrite()) continue
              const refNode = ref.identifier
              const { parent } = refNode

              if (
                parent.type === 'MemberExpression' &&
                parent.object === refNode &&
                !parent.computed
              ) {
                const prop = parent.property.name
                if (!propertyMap.has(prop)) {
                  propertyMap.set(prop, toCamelCaseWithIsPrefix(prop))
                }
              } else {
                hasWholeObjectUsage = true
              }
            }
          }

          context.report({
            node: node.id,
            messageId: 'requireDestructuring',
            data: { name: variableName },
            *fix(fixer) {
              if (hasWholeObjectUsage || propertyMap.size === 0 || !variable)
                return

              const entries = [...propertyMap.entries()]
              const destructuring = entries
                .map(([prop, alias]) => `${prop}: ${alias}`)
                .join(', ')

              yield fixer.replaceText(node.id, `{ ${destructuring} }`)

              for (const ref of variable.references) {
                if (ref.isWrite()) continue
                const { parent } = ref.identifier

                if (
                  parent.type === 'MemberExpression' &&
                  parent.object === ref.identifier &&
                  !parent.computed
                ) {
                  const alias = propertyMap.get(parent.property.name)
                  if (alias) yield fixer.replaceText(parent, alias)
                }
              }
            },
          })
        }
      },
    }
  },
}
