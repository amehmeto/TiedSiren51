/**
 * @fileoverview Disallow spreading an object into individual JSX props
 *
 * When multiple props come from the same object (e.g., `<C a={obj.x} b={obj.y} c={obj.z} />`),
 * consider passing the whole object instead: `<C obj={obj} />`.
 * This reduces coupling between the parent and child components.
 *
 * @author TiedSiren
 */

const DEFAULT_THRESHOLD = 3
const REACT_SPECIAL_PROPS = new Set(['key', 'ref'])

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow passing 3+ props from the same object — pass the object directly instead',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noRedundantPropSpreading:
        "Props {{props}} all come from '{{objectName}}'. Pass '{{objectName}}' as a single prop instead.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'integer',
            minimum: 2,
          },
          ignoredObjects: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const threshold = options.threshold ?? DEFAULT_THRESHOLD
    const ignoredObjects = new Set(options.ignoredObjects ?? [])

    return {
      JSXOpeningElement(node) {
        const propsByObject = new Map()

        for (const attr of node.attributes) {
          if (attr.type !== 'JSXAttribute') continue
          if (!attr.value) continue
          if (attr.value.type !== 'JSXExpressionContainer') continue
          if (REACT_SPECIAL_PROPS.has(attr.name.name)) continue

          const expr = attr.value.expression
          if (expr.type !== 'MemberExpression') continue
          if (expr.object.type !== 'Identifier') continue

          const objectName = expr.object.name
          if (ignoredObjects.has(objectName)) continue

          if (!propsByObject.has(objectName)) {
            propsByObject.set(objectName, [])
          }
          propsByObject.get(objectName).push(attr.name.name)
        }

        for (const [objectName, props] of propsByObject) {
          if (props.length >= threshold) {
            context.report({
              node,
              messageId: 'noRedundantPropSpreading',
              data: {
                props: props.join(', '),
                objectName,
              },
            })
          }
        }
      },
    }
  },
}
