/**
 * @fileoverview Disallow inline import types like `import('module').Type`
 *
 * Inline import types bypass explicit import statements and make dependencies harder to track.
 * Use a proper `import { Type } from 'module'` statement instead.
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow inline import types (e.g. `import("module").Type`)',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      noInlineImportType:
        'Unexpected inline import type. Use a proper `import { {{typeName}} } from "{{modulePath}}"` statement instead.',
    },
    schema: [],
  },

  create(context) {
    return {
      TSImportType(node) {
        const modulePath =
          node.argument?.type === 'TSLiteralType'
            ? node.argument.literal?.value
            : node.argument?.value

        const typeName = node.qualifier?.name ?? 'Type'

        context.report({
          node,
          messageId: 'noInlineImportType',
          data: {
            typeName,
            modulePath: modulePath ?? 'module',
          },
        })
      },
    }
  },
}
