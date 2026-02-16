/**
 * @fileoverview Enforce destructured props and extracted Props type in React components
 * Components should use `function Foo({ bar }: FooProps)` instead of `function Foo(props: { bar: string })`
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce destructured props with extracted type in React components',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      extractPropsType:
        'Extract inline props type to a named type (e.g., `type {{componentName}}Props = ...`).',
      destructureProps:
        'Destructure props parameter instead of using `props`. Use `{ {{suggestedProps}} }: {{componentName}}Props`.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    // Check if a function looks like a React component (PascalCase name)
    function isReactComponent(node) {
      const name = node.id?.name
      if (!name) return false
      // PascalCase check: starts with uppercase letter
      return /^[A-Z]/.test(name)
    }

    // Check if the type annotation is inline (not a type reference)
    function isInlineType(typeAnnotation) {
      if (!typeAnnotation) return false
      const type = typeAnnotation.typeAnnotation
      if (!type) return false

      // Inline object type: { foo: string }
      if (type.type === 'TSTypeLiteral') return true

      // Readonly<{ foo: string }> - check if the type argument is inline
      if (
        type.type === 'TSTypeReference' &&
        type.typeName?.name === 'Readonly' &&
        type.typeArguments?.params?.[0]?.type === 'TSTypeLiteral'
      )
        return true

      return false
    }

    // Get property names from a type literal for destructuring
    function getPropertyNames(typeAnnotation) {
      if (!typeAnnotation?.typeAnnotation) return []

      let typeLiteral = typeAnnotation.typeAnnotation

      // Handle Readonly<{ ... }>
      if (
        typeLiteral.type === 'TSTypeReference' &&
        typeLiteral.typeName?.name === 'Readonly'
      )
        typeLiteral = typeLiteral.typeArguments?.params?.[0]

      if (typeLiteral?.type !== 'TSTypeLiteral') return []

      if (!Array.isArray(typeLiteral.members)) return []
      return typeLiteral.members
        .filter((m) => m.type === 'TSPropertySignature' && m.key?.name)
        .map((m) => m.key.name)
    }

    // Get the full type text from a type annotation
    function getTypeText(typeAnnotation) {
      if (!typeAnnotation?.typeAnnotation) return null
      return sourceCode.getText(typeAnnotation.typeAnnotation)
    }

    // Check if parameter is named 'props' (not destructured)
    function isPropsParameter(param) {
      return param.type === 'Identifier' && param.name === 'props'
    }

    // Find the appropriate insertion point for the type declaration
    function findTypeInsertionPoint(node) {
      // Look for existing type/interface declarations before the function
      let current = node
      while (current.parent) {
        if (current.parent.type === 'Program' || current.parent.type === 'ExportNamedDeclaration') {
          break
        }
        current = current.parent
      }

      // If exported, use the export declaration
      if (current.parent?.type === 'ExportNamedDeclaration') {
        return current.parent.range[0]
      }

      return current.range[0]
    }

    // Generate the type declaration text
    function generateTypeDeclaration(componentName, typeText) {
      return `type ${componentName}Props = ${typeText}\n\n`
    }

    // Find all props.X member expressions in a function body and return fixes
    function findPropsUsagesInBody(fixer, functionNode, propNames) {
      const fixes = []

      // Walk through the function body to find props.X usages
      function walkNode(node) {
        if (!node || typeof node !== 'object') return

        // Check for props.X pattern
        if (
          node.type === 'MemberExpression' &&
          node.object?.type === 'Identifier' &&
          node.object.name === 'props' &&
          node.property?.type === 'Identifier' &&
          propNames.includes(node.property.name)
        ) {
          // Replace props.X with X
          fixes.push(fixer.replaceText(node, node.property.name))
          return // Don't walk children
        }

        // Walk all child nodes
        for (const key of Object.keys(node)) {
          if (key === 'parent') continue
          const child = node[key]
          if (Array.isArray(child)) {
            child.forEach(walkNode)
          } else if (child && typeof child === 'object' && child.type) {
            walkNode(child)
          }
        }
      }

      if (functionNode.body) {
        walkNode(functionNode.body)
      }

      return fixes
    }

    function checkFunctionComponent(node) {
      if (!isReactComponent(node)) return

      const params = node.params
      if (params.length === 0) return

      const firstParam = params[0]
      const componentName = node.id.name
      const propsTypeName = `${componentName}Props`

      // Case 1: props parameter (not destructured)
      if (isPropsParameter(firstParam)) {
        const propNames = getPropertyNames(firstParam.typeAnnotation)
        const suggestedProps = propNames.length > 0 ? propNames.join(', ') : '...'
        const typeText = getTypeText(firstParam.typeAnnotation)

        context.report({
          node: firstParam,
          messageId: 'destructureProps',
          data: {
            componentName,
            suggestedProps,
          },
          fix(fixer) {
            const fixes = []

            // If we have property names, we can generate the destructured pattern
            if (propNames.length > 0) {
              const destructuredPattern = `{ ${propNames.join(', ')} }`

              // propNames.length > 0 implies hasInlineType is true (since getPropertyNames
              // only returns non-empty for TSTypeLiteral types)
              const insertPoint = findTypeInsertionPoint(node)
              fixes.push(fixer.insertTextBeforeRange([insertPoint, insertPoint], generateTypeDeclaration(componentName, typeText)))
              fixes.push(fixer.replaceText(firstParam, `${destructuredPattern}: ${propsTypeName}`))

              // Also fix props.X usages in the function body
              const bodyFixes = findPropsUsagesInBody(fixer, node, propNames)
              fixes.push(...bodyFixes)
            }

            return fixes
          },
        })
        return
      }

      // Case 2: Destructured but with inline type
      if (
        firstParam.type === 'ObjectPattern' &&
        isInlineType(firstParam.typeAnnotation)
      ) {
        const typeText = getTypeText(firstParam.typeAnnotation)

        context.report({
          node: firstParam.typeAnnotation,
          messageId: 'extractPropsType',
          data: { componentName },
          fix(fixer) {
            if (!typeText) return null

            const fixes = []

            // 1) Add type declaration before the function
            const insertPoint = findTypeInsertionPoint(node)
            fixes.push(fixer.insertTextBeforeRange([insertPoint, insertPoint], generateTypeDeclaration(componentName, typeText)))

            // 2) Replace inline type with type reference
            fixes.push(fixer.replaceText(firstParam.typeAnnotation, `: ${propsTypeName}`))

            return fixes
          },
        })
      }
    }

    return {
      FunctionDeclaration(node) {
        checkFunctionComponent(node)
      },
    }
  },
}
