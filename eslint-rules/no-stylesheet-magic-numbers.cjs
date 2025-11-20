/**
 * @fileoverview Disallow magic numbers in specific StyleSheet properties that should use theme values
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow magic numbers in StyleSheet properties that should use theme values',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noMagicNumber:
        'Magic number {{value}} in "{{property}}" property. Use theme values like T.spacing.*, T.fontSize.*, T.radius.*, etc.',
    },
    schema: [],
  },

  create(context) {
    // CSS properties that should NOT have magic numbers (must use theme)
    const RESTRICTED_PROPERTIES = new Set([
      // Spacing
      'padding',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'paddingHorizontal',
      'paddingVertical',
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'marginHorizontal',
      'marginVertical',
      'gap',
      'rowGap',
      'columnGap',
      // Typography
      'fontSize',
      'lineHeight',
      'letterSpacing',
      // Dimensions
      'width',
      'height',
      'minWidth',
      'minHeight',
      'maxWidth',
      'maxHeight',
      // Border radius
      'borderRadius',
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
      'borderTopStartRadius',
      'borderTopEndRadius',
      'borderBottomStartRadius',
      'borderBottomEndRadius',
      // Border width
      'borderWidth',
      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
      'borderLeftWidth',
      'borderStartWidth',
      'borderEndWidth',
      // Positioning
      'top',
      'right',
      'bottom',
      'left',
      'start',
      'end',
    ])

    // Numbers that are always acceptable (even in restricted properties)
    const ALLOWED_VALUES = new Set([0, 1, -1])

    function isStyleSheetCreate(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'StyleSheet' &&
        node.callee.property.name === 'create'
      )
    }

    function checkStyleObject(properties) {
      properties.forEach((prop) => {
        if (prop.type !== 'Property') return

        const propertyName = prop.key.name || prop.key.value
        const value = prop.value

        // Check if this property should use theme values
        if (RESTRICTED_PROPERTIES.has(propertyName)) {
          // Check if value is a numeric literal
          if (value.type === 'Literal' && typeof value.value === 'number') {
            // Allow specific values like 0, 1, -1
            if (!ALLOWED_VALUES.has(value.value)) {
              context.report({
                node: value,
                messageId: 'noMagicNumber',
                data: {
                  value: value.value,
                  property: propertyName,
                },
              })
            }
          }

          // Check if value is a unary expression like -10
          if (
            value.type === 'UnaryExpression' &&
            value.operator === '-' &&
            value.argument.type === 'Literal' &&
            typeof value.argument.value === 'number'
          ) {
            const numValue = -value.argument.value
            if (!ALLOWED_VALUES.has(numValue)) {
              context.report({
                node: value,
                messageId: 'noMagicNumber',
                data: {
                  value: numValue,
                  property: propertyName,
                },
              })
            }
          }
        }
      })
    }

    return {
      CallExpression(node) {
        if (!isStyleSheetCreate(node)) return

        const arg = node.arguments[0]
        if (!arg || arg.type !== 'ObjectExpression') return

        // Iterate through each style definition
        arg.properties.forEach((styleProp) => {
          if (
            styleProp.type === 'Property' &&
            styleProp.value.type === 'ObjectExpression'
          ) {
            // This is a style object like { container: { padding: 16 } }
            checkStyleObject(styleProp.value.properties)
          }
        })
      },
    }
  },
}
