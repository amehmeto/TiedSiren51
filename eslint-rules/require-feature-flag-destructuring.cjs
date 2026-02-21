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

function isSelectFeatureFlagsCall(node) {
  if (
    node.id.type !== 'Identifier' ||
    !node.init ||
    node.init.type !== 'CallExpression'
  )
    return false

  const { callee } = node.init
  if (callee.type !== 'Identifier' || callee.name !== 'useSelector')
    return false

  const [firstArg] = node.init.arguments
  return (
    firstArg &&
    firstArg.type === 'Identifier' &&
    firstArg.name === 'selectFeatureFlags'
  )
}

function isDestructuringOf({ type, id, init }, refNode) {
  return (
    type === 'VariableDeclarator' &&
    id.type === 'ObjectPattern' &&
    init === refNode
  )
}

function isMemberAccessOf({ type, object, computed }, refNode) {
  return type === 'MemberExpression' && object === refNode && !computed
}

function classifyReferences(variable) {
  const propertyMap = new Map()
  let hasWholeObjectUsage = false
  let hasDestructuringBinding = false

  for (const ref of variable.references) {
    if (ref.isWrite()) continue
    const refNode = ref.identifier
    const { parent } = refNode

    if (isDestructuringOf(parent, refNode)) {
      hasDestructuringBinding = true
      continue
    }

    if (isMemberAccessOf(parent, refNode)) {
      const camelAlias = toCamelCaseWithIsPrefix(parent.property.name)
      propertyMap.set(parent.property.name, camelAlias)
      continue
    }

    hasWholeObjectUsage = true
  }

  return { propertyMap, hasWholeObjectUsage, hasDestructuringBinding }
}

function shouldSkipReport({
  hasDestructuringBinding,
  hasWholeObjectUsage,
  propertyMap,
}) {
  return (
    hasDestructuringBinding || (hasWholeObjectUsage && propertyMap.size === 0)
  )
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
        if (isSelectFeatureFlagsCall(node)) pendingNodes.push(node)
      },

      'Program:exit'() {
        const sourceCode = context.sourceCode ?? context.getSourceCode()

        for (const node of pendingNodes) {
          const variableName = node.id.name
          const scope = sourceCode.getScope(node)
          const variable = scope.variables.find((v) => v.name === variableName)

          if (!variable) continue

          const { propertyMap, hasWholeObjectUsage, hasDestructuringBinding } =
            classifyReferences(variable)

          if (
            shouldSkipReport({
              hasDestructuringBinding,
              hasWholeObjectUsage,
              propertyMap,
            })
          )
            continue

          context.report({
            node: node.id,
            messageId: 'requireDestructuring',
            data: { name: variableName },
            *fix(fixer) {
              if (hasWholeObjectUsage || propertyMap.size === 0) return

              const entries = [...propertyMap.entries()]
              const destructuring = entries
                .map(([prop, alias]) => `${prop}: ${alias}`)
                .join(', ')

              yield fixer.replaceText(node.id, `{ ${destructuring} }`)

              for (const ref of variable.references) {
                if (ref.isWrite()) continue
                const { parent } = ref.identifier

                if (isMemberAccessOf(parent, ref.identifier)) {
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
