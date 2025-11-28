/**
 * @fileoverview Disallow magic numbers for icon size prop in @expo/vector-icons components
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow magic numbers for size prop in @expo/vector-icons components',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noMagicIconSize:
        'Magic number {{value}} in icon size prop. Use T.icon.size.* (xSmall, small, medium, large, xLarge, xxLarge).',
    },
    schema: [],
  },

  create(context) {
    // Track icon imports from @expo/vector-icons
    const iconImports = new Set()

    return {
      ImportDeclaration(node) {
        // Check if importing from @expo/vector-icons
        if (
          node.source.value === '@expo/vector-icons' ||
          node.source.value.startsWith('@expo/vector-icons/')
        ) {
          node.specifiers.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
              // Named import: import { Ionicons } from '@expo/vector-icons'
              iconImports.add(specifier.local.name)
            } else if (specifier.type === 'ImportDefaultSpecifier') {
              // Default import: import Ionicons from '@expo/vector-icons/Ionicons'
              iconImports.add(specifier.local.name)
            }
          })
        }
      },

      JSXOpeningElement(node) {
        // Check if this is an icon component we're tracking
        const componentName =
          node.name.type === 'JSXIdentifier' ? node.name.name : null

        if (!componentName || !iconImports.has(componentName)) return

        // Find the size prop
        const sizeProp = node.attributes.find(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            attr.name &&
            attr.name.name === 'size'
        )

        if (!sizeProp || !sizeProp.value) return

        // Check if size is a JSX expression with a numeric literal
        if (sizeProp.value.type === 'JSXExpressionContainer') {
          const expr = sizeProp.value.expression

          // Direct numeric literal: size={28}
          if (expr.type === 'Literal' && typeof expr.value === 'number') {
            context.report({
              node: expr,
              messageId: 'noMagicIconSize',
              data: {
                value: expr.value,
              },
            })
          }
        }
      },
    }
  },
}
