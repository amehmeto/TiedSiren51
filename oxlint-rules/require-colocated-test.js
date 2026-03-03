/**
 * @fileoverview Require colocated test files for usecases, listeners, selectors, schemas, view-models, and helpers
 * @author TiedSiren
 */

import fs from 'fs'
import path from 'path'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require colocated test files for core modules (usecases, listeners, selectors, schemas, view-models, helpers)',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingUsecaseTest:
        'Usecase "{{filename}}" must have a colocated test file ({{expected}}).',
      missingListenerTest:
        'Listener "{{filename}}" must have a colocated test file ({{expected}}).',
      missingSelectorTest:
        'Selector "{{filename}}" must have a colocated test file ({{expected}}).',
      missingSchemaTest:
        'Schema "{{filename}}" must have a colocated test file ({{expected}}).',
      missingViewModelTest:
        'View model "{{filename}}" must have a colocated test file ({{expected}}).',
      missingHelperTest:
        'Helper "{{filename}}" must have a colocated test file ({{expected}}).',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip test files themselves
    if (filename.endsWith('.test.ts') || filename.endsWith('.spec.ts')) {
      return {}
    }

    // Skip fixture, builder, and other non-source files
    if (
      filename.includes('.fixture.') ||
      filename.includes('.builder.') ||
      filename.includes('.mock.')
    ) {
      return {}
    }

    const dirname = path.dirname(filename)
    const basename = path.basename(filename)

    function testFileExists(baseName) {
      const nameWithoutExt = baseName.replace('.ts', '')
      const testFile = path.join(dirname, `${nameWithoutExt}.test.ts`)
      const specFile = path.join(dirname, `${nameWithoutExt}.spec.ts`)
      return fs.existsSync(testFile) || fs.existsSync(specFile)
    }

    return {
      Program(node) {
        // Usecase files: *.usecase.ts
        if (basename.endsWith('.usecase.ts')) {
          if (!testFileExists(basename)) {
            const expected = basename.replace('.ts', '.spec.ts')
            context.report({
              node,
              messageId: 'missingUsecaseTest',
              data: { filename: basename, expected },
            })
          }
        }

        // Listener files: *.listener.ts
        if (basename.endsWith('.listener.ts')) {
          if (!testFileExists(basename)) {
            const expected = basename.replace('.ts', '.test.ts')
            context.report({
              node,
              messageId: 'missingListenerTest',
              data: { filename: basename, expected },
            })
          }
        }

        // Selector files in selectors/ directory starting with "select"
        if (
          filename.includes('/selectors/') &&
          basename.startsWith('select') &&
          basename.endsWith('.ts')
        ) {
          if (!testFileExists(basename)) {
            const expected = basename.replace('.ts', '.test.ts')
            context.report({
              node,
              messageId: 'missingSelectorTest',
              data: { filename: basename, expected },
            })
          }
        }

        // Schema files: *.schema.ts
        if (basename.endsWith('.schema.ts')) {
          if (!testFileExists(basename)) {
            const expected = basename.replace('.ts', '.test.ts')
            context.report({
              node,
              messageId: 'missingSchemaTest',
              data: { filename: basename, expected },
            })
          }
        }

        // View model files: *.view-model.ts
        if (basename.endsWith('.view-model.ts')) {
          if (!testFileExists(basename)) {
            const expected = basename.replace('.ts', '.test.ts')
            context.report({
              node,
              messageId: 'missingViewModelTest',
              data: { filename: basename, expected },
            })
          }
        }

        // Helper files: *.helper.ts
        if (basename.endsWith('.helper.ts')) {
          if (!testFileExists(basename)) {
            const expected = basename.replace('.ts', '.test.ts')
            context.report({
              node,
              messageId: 'missingHelperTest',
              data: { filename: basename, expected },
            })
          }
        }
      },
    }
  },
}
