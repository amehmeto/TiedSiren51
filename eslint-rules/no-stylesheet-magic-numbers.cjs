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
      // Shadow and elevation
      'shadowRadius',
      'elevation',
      // Note: shadowOpacity is intentionally excluded - it's contextual to the specific shadow effect
    ])

    // No magic numbers are allowed - all values must come from theme
    // Use T.spacing.none, T.border.width.none, T.border.width.thin, etc.

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

        // If value is a nested object (like shadowOffset), recursively check it
        if (value.type === 'ObjectExpression') {
          checkStyleObject(value.properties)
          return
        }

        // Check if this property should use theme values
        if (RESTRICTED_PROPERTIES.has(propertyName)) {
          // Check if value is a numeric literal
          if (value.type === 'Literal' && typeof value.value === 'number') {
            context.report({
              node: value,
              messageId: 'noMagicNumber',
              data: {
                value: value.value,
                property: propertyName,
              },
            })
          }

          // Check if value is a unary expression like -10
          if (
            value.type === 'UnaryExpression' &&
            value.operator === '-' &&
            value.argument.type === 'Literal' &&
            typeof value.argument.value === 'number'
          ) {
            const numValue = -value.argument.value
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
