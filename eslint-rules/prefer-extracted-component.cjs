/**
 * @fileoverview Suggest extracting large JSX elements with few dynamic props into reusable components
 *
 * Detects JSX elements that span many lines but only expose a few dynamic props,
 * indicating the element is mostly boilerplate and could be extracted into a
 * simpler, reusable component (atomic design principle).
 *
 * Example violation:
 *   <Pressable
 *     onPress={onPress}
 *     style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
 *     accessibilityRole="button"
 *     accessibilityLabel={label}
 *   >
 *     {children}
 *   </Pressable>
 *
 * Suggested fix: Extract into <OpacityPressable onPress={onPress}> component.
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggest extracting large JSX elements with few dynamic props into reusable components',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      extractComponent:
        '<{{elementName}}> spans {{lineCount}} lines but only has {{dynamicCount}} dynamic prop(s). Consider extracting into a reusable component.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxLines: {
            type: 'integer',
            minimum: 1,
            default: 8,
          },
          maxDynamicProps: {
            type: 'integer',
            minimum: 0,
            default: 3,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const maxLines = options.maxLines ?? 8
    const maxDynamicProps = options.maxDynamicProps ?? 3

    function getElementName(openingElement) {
      const name = openingElement.name
      if (name.type === 'JSXIdentifier') return name.name
      if (name.type === 'JSXMemberExpression') return name.property.name
      return 'Component'
    }

    function isDynamicValue(node) {
      if (!node) return false

      // JSXExpressionContainer wrapping an expression = dynamic
      if (node.type === 'JSXExpressionContainer') {
        const expr = node.expression

        // Literal inside expression container is still static: {42}, {"text"}
        // Template literal with no expressions is static: {`text`}
        if (expr.type === 'Literal') return false
        if (expr.type === 'TemplateLiteral' && expr.expressions.length === 0)
          return false

        return true
      }

      // Bare string literal (JSX attribute without braces) = static
      // e.g., accessibilityRole="button"
      return false
    }

    function countDynamicProps(openingElement) {
      let count = 0
      for (const attr of openingElement.attributes) {
        if (attr.type === 'JSXSpreadAttribute') {
          // Spread attributes are always dynamic
          count++
          continue
        }

        if (attr.type === 'JSXAttribute' && isDynamicValue(attr.value)) count++
      }
      return count
    }

    function getLineSpan(node) {
      return node.loc.end.line - node.loc.start.line + 1
    }

    function isInsideComponentFunction(node) {
      let current = node.parent
      while (current) {
        if (
          current.type === 'FunctionDeclaration' ||
          current.type === 'FunctionExpression' ||
          current.type === 'ArrowFunctionExpression'
        ) {
          // Check if it's a PascalCase component
          const name =
            current.id?.name ||
            (current.parent?.type === 'VariableDeclarator'
              ? current.parent.id?.name
              : null)

          if (name && /^[A-Z]/.test(name)) return true
        }
        current = current.parent
      }
      return false
    }

    function hasChildren(jsxElement) {
      return (
        jsxElement.children &&
        jsxElement.children.some(
          (child) =>
            child.type === 'JSXElement' ||
            child.type === 'JSXFragment' ||
            child.type === 'JSXExpressionContainer',
        )
      )
    }

    return {
      JSXElement(node) {
        // Only check inside React component functions
        if (!isInsideComponentFunction(node)) return

        // Skip if this JSX element is the direct return value (it IS the component)
        // But do NOT skip if it's inside a conditional/logical — those branches
        // are exactly the pattern we want to flag for extraction
        if (node.parent.type === 'ReturnStatement') return

        // Must have children (acts as a wrapper)
        if (!hasChildren(node)) return

        const lineCount = getLineSpan(node)
        if (lineCount < maxLines) return

        const dynamicCount = countDynamicProps(node.openingElement)
        if (dynamicCount > maxDynamicProps) return

        const elementName = getElementName(node.openingElement)

        context.report({
          node: node.openingElement,
          messageId: 'extractComponent',
          data: {
            elementName,
            lineCount: String(lineCount),
            dynamicCount: String(dynamicCount),
          },
        })
      },
    }
  },
}
