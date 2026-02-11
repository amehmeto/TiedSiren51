/**
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow passing useSelector results as props to child components. The child should call useSelector itself.',
      recommended: false,
    },
    messages: {
      noSelectorPropDrilling:
        'Do not pass useSelector result "{{variable}}" as prop "{{prop}}". The child component should call useSelector itself.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoredComponents: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Component names to ignore (e.g. framework components like FlatList that cannot call useSelector).',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {}
    const ignoredComponents = new Set(options.ignoredComponents || [])

    // Track variable names assigned from useSelector()
    const selectorVars = new Set()

    return {
      // Detect: const value = useSelector(...)
      // Detect: const { a, b } = useSelector(...)
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'CallExpression' &&
          node.init.callee.type === 'Identifier' &&
          node.init.callee.name === 'useSelector'
        ) {
          if (node.id.type === 'Identifier') {
            selectorVars.add(node.id.name)
          }

          if (node.id.type === 'ObjectPattern') {
            for (const prop of node.id.properties) {
              if (prop.type === 'Property' && prop.value.type === 'Identifier')
                selectorVars.add(prop.value.name)
            }
          }
        }
      },

      // Detect: <Child prop={selectorVar} />
      JSXExpressionContainer(node) {
        // Must be a JSX attribute value (not children)
        if (!node.parent || node.parent.type !== 'JSXAttribute') return

        // The expression must be a tracked identifier
        if (node.expression.type !== 'Identifier') return
        const varName = node.expression.name
        if (!selectorVars.has(varName)) return

        // Walk up to the JSXOpeningElement to get the component name
        const attribute = node.parent
        const openingElement = attribute.parent
        if (!openingElement || openingElement.type !== 'JSXOpeningElement')
          return

        const elementName = openingElement.name

        // Only flag user components (PascalCase or namespaced like NS.Component)
        const isComponent =
          (elementName.type === 'JSXIdentifier' &&
            /^[A-Z]/.test(elementName.name)) ||
          elementName.type === 'JSXMemberExpression'

        if (!isComponent) return

        // Skip framework components that cannot call useSelector
        const componentName =
          elementName.type === 'JSXIdentifier' ? elementName.name : null
        if (componentName && ignoredComponents.has(componentName)) return

        const propName =
          attribute.name.type === 'JSXIdentifier' ? attribute.name.name : ''

        context.report({
          node: attribute,
          messageId: 'noSelectorPropDrilling',
          data: {
            variable: varName,
            prop: propName,
          },
        })
      },
    }
  },
}
