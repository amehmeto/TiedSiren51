/**
 * @fileoverview Enforce comprehensive file naming conventions across the codebase
 * @author TiedSiren
 *
 * This rule enforces consistent file naming patterns for each layer of the application:
 * - core/: Domain logic with specific patterns for usecases, listeners, selectors, etc.
 * - infra/: Infrastructure implementations with implementation-type prefix
 * - ui/: React components (PascalCase) and utilities (kebab-case)
 * - app/: Expo Router routes with kebab-case
 */

const path = require('path')

// Helper to check if string is kebab-case
function isKebabCase(str) {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(str)
}

// Helper to check if string is PascalCase
function isPascalCase(str) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str)
}

// Helper to check if string is camelCase
function isCamelCase(str) {
  return /^[a-z][a-zA-Z0-9]*$/.test(str)
}

// Helper to extract base name without extension
function getBaseName(filename) {
  return filename.replace(/\.(ts|tsx|js|jsx|cjs|mjs)$/, '')
}

// Helper to get file parts (e.g., "block-session.usecase.spec" -> ["block-session", "usecase", "spec"])
function getFileParts(basename) {
  return basename.split('.')
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce comprehensive file naming conventions across the codebase',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      // Core layer messages
      coreUsecaseNaming:
        'Usecase files must be named "kebab-case.usecase.ts". Got: "{{filename}}"',
      coreUsecaseTestNaming:
        'Usecase test files must be named "kebab-case.usecase.spec.ts". Got: "{{filename}}"',
      coreListenerNaming:
        'Listener files must be named "on-kebab-case.listener.ts". Got: "{{filename}}"',
      coreListenerTestNaming:
        'Listener test files must be named "on-kebab-case.listener.test.ts". Got: "{{filename}}"',
      coreSelectorNaming:
        'Selector files must be named "selectCamelCase.ts" or "kebab-case.view-model.ts". Got: "{{filename}}"',
      coreSelectorTestNaming:
        'Selector test files must be named "selectCamelCase.test.ts" or "kebab-case.view-model.test.ts". Got: "{{filename}}"',
      coreSliceNaming:
        'Redux slice files must be named "kebab-case.slice.ts". Got: "{{filename}}"',
      coreFixtureNaming:
        'Fixture files must be named "kebab-case.fixture.ts". Got: "{{filename}}"',
      coreBuilderNaming:
        'Data builder files must be named "kebab-case.builder.ts". Got: "{{filename}}"',
      corePortNaming:
        'Port files must be named "kebab-case.ts" (e.g., "auth.gateway.ts", "date-provider.ts"). Got: "{{filename}}"',
      coreUtilsNaming:
        'Utils files must be named "kebab-case.utils.ts". Got: "{{filename}}"',
      coreEntityNaming:
        'Domain entity files must be named "kebab-case.ts" (e.g., "block-session.ts", "auth-user.ts"). Got: "{{filename}}"',
      coreTypeFileNaming:
        'Type files must use ".type.ts" suffix (not ".types.ts"). Got: "{{filename}}"',

      // Infra layer messages
      infraImplementationNaming:
        'Infrastructure files must be named "{implementation}.{port-name}.ts" (e.g., "prisma.block-session.repository.ts", "in-memory.logger.ts"). Got: "{{filename}}"',
      infraTestNaming:
        'Infrastructure test files must use ".test.ts" suffix (not ".spec.ts"). Got: "{{filename}}"',
      infraTestPattern:
        'Infrastructure test files must be named "{implementation}.{port-name}.test.ts". Got: "{{filename}}"',

      // Folder structure messages
      uiScreenFolderNaming:
        'UI screen folders must be PascalCase. File "{{filename}}" is in a non-PascalCase screen folder: "{{folder}}"',
      coreSpecialFolderNaming:
        'Core special folders must use underscore prefix (_ports_, _redux_, _tests_) or double underscore (__utils__, __constants__). Got: "{{folder}}"',
      infraFolderNaming:
        'Infra folders must be kebab-case matching the port name. Got: "{{folder}}"',

      // UI layer messages
      uiComponentNaming:
        'React component files (.tsx) must be named in PascalCase (e.g., "SessionCard.tsx"). Got: "{{filename}}"',
      uiHookNaming:
        'React hook files must be named "useCamelCase.ts" (e.g., "useAppForeground.ts"). Got: "{{filename}}"',
      uiViewModelNaming:
        'View model files must be named "kebab-case.view-model.ts". Got: "{{filename}}"',
      uiSchemaNaming:
        'Schema files must be named "kebab-case.schema.ts". Got: "{{filename}}"',
      uiUtilityNaming:
        'UI utility files must be named in kebab-case. Got: "{{filename}}"',

      // App layer messages
      appRouteNaming:
        'Route files must be named in kebab-case (e.g., "forgot-password.tsx") or be special files (_layout.tsx, index.tsx, +html.tsx). Got: "{{filename}}"',

      // Generic messages
      genericKebabCase:
        'File must be named in kebab-case (all lowercase with hyphens). Got: "{{filename}}"',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    const relativePath = filename
    const basename = path.basename(filename)
    const baseName = getBaseName(basename)
    const parts = getFileParts(baseName)
    const extension = path.extname(filename)
    const isTestFile = basename.includes('.test.') || basename.includes('.spec.')
    const isTsx = extension === '.tsx'
    const isTs = extension === '.ts'

    return {
      Program(node) {
        // ==========================================
        // CORE LAYER RULES
        // ==========================================

        // core/*/usecases/ - Usecase files
        if (relativePath.includes('/usecases/') && relativePath.includes('/core/')) {
          if (isTestFile) {
            // Usecase tests: kebab-case.usecase.spec.ts
            if (!basename.match(/^[a-z][a-z0-9-]*\.usecase\.spec\.ts$/)) {
              // Allow fixture files in usecases folder
              if (!basename.includes('.fixture.')) {
                context.report({
                  node,
                  messageId: 'coreUsecaseTestNaming',
                  data: { filename: basename },
                })
              }
            }
          } else if (isTs && !basename.includes('.fixture.')) {
            // Usecase implementation: kebab-case.usecase.ts
            if (!basename.match(/^[a-z][a-z0-9-]*\.usecase\.ts$/)) {
              context.report({
                node,
                messageId: 'coreUsecaseNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // core/*/listeners/ - Listener files
        if (relativePath.includes('/listeners/') && relativePath.includes('/core/')) {
          if (isTestFile) {
            // Listener tests: on-*.listener.test.ts
            if (!basename.match(/^on-[a-z][a-z0-9-]*\.listener\.test\.ts$/)) {
              context.report({
                node,
                messageId: 'coreListenerTestNaming',
                data: { filename: basename },
              })
            }
          } else if (isTs) {
            // Listener implementation: on-*.listener.ts
            if (!basename.match(/^on-[a-z][a-z0-9-]*\.listener\.ts$/)) {
              context.report({
                node,
                messageId: 'coreListenerNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // core/*/selectors/ - Selector files
        if (relativePath.includes('/selectors/') && relativePath.includes('/core/')) {
          if (isTestFile) {
            // Selector tests: selectCamelCase.test.ts OR kebab-case.view-model.test.ts
            const isValidSelectorTest = basename.match(/^select[A-Z][a-zA-Z0-9]*\.test\.ts$/)
            const isValidViewModelTest = basename.match(/^[a-z][a-z0-9-]*\.view-model\.test\.ts$/)
            if (!isValidSelectorTest && !isValidViewModelTest) {
              context.report({
                node,
                messageId: 'coreSelectorTestNaming',
                data: { filename: basename },
              })
            }
          } else if (isTs) {
            // Selector implementation: selectCamelCase.ts OR kebab-case.view-model.ts
            const isValidSelector = basename.match(/^select[A-Z][a-zA-Z0-9]*\.ts$/)
            const isValidViewModel = basename.match(/^[a-z][a-z0-9-]*\.view-model\.ts$/)
            const isValidViewModelType = basename.match(/^[a-z][a-z0-9-]*-view-model\.type\.ts$/)
            const isValidIsActive = basename === 'isActive.ts' // Exception for legacy file
            if (!isValidSelector && !isValidViewModel && !isValidViewModelType && !isValidIsActive) {
              context.report({
                node,
                messageId: 'coreSelectorNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // core/*/ - Slice files (at domain root)
        if (
          relativePath.includes('/core/') &&
          !relativePath.includes('/usecases/') &&
          !relativePath.includes('/listeners/') &&
          !relativePath.includes('/selectors/') &&
          !relativePath.includes('/_tests_/') &&
          !relativePath.includes('/_ports_/') &&
          !relativePath.includes('/_redux_/') &&
          !relativePath.includes('/__utils__/') &&
          !relativePath.includes('/__constants__/') &&
          basename.includes('.slice.')
        ) {
          if (!basename.match(/^[a-z][a-z0-9-]*\.slice\.ts$/)) {
            context.report({
              node,
              messageId: 'coreSliceNaming',
              data: { filename: basename },
            })
          }
        }

        // core/_tests_/data-builders/ - Builder files
        if (relativePath.includes('/data-builders/')) {
          if (!basename.match(/^[a-z][a-z0-9-]*\.builder\.ts$/)) {
            context.report({
              node,
              messageId: 'coreBuilderNaming',
              data: { filename: basename },
            })
          }
        }

        // Fixture files anywhere in core
        if (relativePath.includes('/core/') && basename.includes('.fixture.')) {
          if (!basename.match(/^[a-z][a-z0-9-]*\.fixture\.ts$/)) {
            context.report({
              node,
              messageId: 'coreFixtureNaming',
              data: { filename: basename },
            })
          }
        }

        // core/_ports_/ - Port interface files
        if (relativePath.includes('/_ports_/')) {
          // Ports should be kebab-case.ts (e.g., auth.gateway.ts, date-provider.ts)
          if (!basename.match(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*|-[a-z][a-z0-9]*)*\.ts$/)) {
            context.report({
              node,
              messageId: 'corePortNaming',
              data: { filename: basename },
            })
          }
        }

        // core/__utils__/ - Utility files
        if (relativePath.includes('/__utils__/')) {
          if (isTestFile) {
            if (!basename.match(/^[a-z][a-z0-9-]*\.utils\.test\.ts$/)) {
              context.report({
                node,
                messageId: 'coreUtilsNaming',
                data: { filename: basename },
              })
            }
          } else if (isTs) {
            if (!basename.match(/^[a-z][a-z0-9-]*\.utils\.ts$/)) {
              context.report({
                node,
                messageId: 'coreUtilsNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // Type files: enforce .type.ts (not .types.ts)
        if (relativePath.includes('/core/') && basename.includes('.types.')) {
          context.report({
            node,
            messageId: 'coreTypeFileNaming',
            data: { filename: basename },
          })
        }

        // Domain entity files at root of each domain in core
        // These are files like block-session.ts, blocklist.ts, auth-user.ts
        // They must be kebab-case.ts (not camelCase or PascalCase, not dot-separated)
        if (
          relativePath.includes('/core/') &&
          !relativePath.includes('/usecases/') &&
          !relativePath.includes('/listeners/') &&
          !relativePath.includes('/selectors/') &&
          !relativePath.includes('/_tests_/') &&
          !relativePath.includes('/_ports_/') &&
          !relativePath.includes('/_redux_/') &&
          !relativePath.includes('/__utils__/') &&
          !relativePath.includes('/__constants__/') &&
          isTs &&
          !isTestFile &&
          !basename.includes('.slice.') &&
          !basename.includes('.fixture.') &&
          !basename.includes('.type.')
        ) {
          // Domain entity files should be kebab-case.ts
          if (!isKebabCase(baseName)) {
            context.report({
              node,
              messageId: 'coreEntityNaming',
              data: { filename: basename },
            })
          }
        }

        // ==========================================
        // INFRA LAYER RULES
        // ==========================================

        // Infra files follow the pattern: {implementation-name}.{port-name}.ts
        // - implementation-name: kebab-case describing HOW it's implemented (e.g., prisma, fake-data, in-memory, real, expo)
        // - port-name: kebab-case matching the port interface file (e.g., block-session.repository, auth.gateway, logger)
        // Examples:
        //   prisma.block-session.repository.ts implements block-session.repository.ts
        //   in-memory.logger.ts implements logger.ts
        //   real.date-provider.ts implements date-provider.ts

        if (relativePath.includes('/infra/') && !relativePath.includes('/__abstract__/')) {
          // Pattern: kebab-case.kebab-case[.kebab-case...].ts
          // At minimum: {impl}.{port}.ts (two dot-separated parts before .ts)
          const infraImplPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*(\.[a-z][a-z0-9]*(-[a-z0-9]+)*)+\.ts$/
          // Infra tests MUST use .test.ts (not .spec.ts) - .spec.ts is reserved for usecases
          const infraTestPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*(\.[a-z][a-z0-9]*(-[a-z0-9]+)*)+\.test\.ts$/

          if (isTestFile) {
            // Check if using .spec.ts (wrong for infra)
            if (basename.includes('.spec.ts')) {
              context.report({
                node,
                messageId: 'infraTestNaming',
                data: { filename: basename },
              })
            }
            // Check pattern: {impl}.{port}.test.ts
            else if (!infraTestPattern.test(basename)) {
              context.report({
                node,
                messageId: 'infraTestPattern',
                data: { filename: basename },
              })
            }
          } else if (isTs) {
            // Infrastructure implementation: {impl}.{port}.ts
            // Also allow config files like firebaseConfig.ts
            const isConfigFile = basename.match(/^[a-z][a-zA-Z]*Config\.ts$/)
            if (!infraImplPattern.test(basename) && !isConfigFile) {
              context.report({
                node,
                messageId: 'infraImplementationNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // ==========================================
        // UI LAYER RULES
        // ==========================================

        if (relativePath.includes('/ui/')) {
          // Skip fixture files - they follow kebab-case.fixture.ts pattern
          if (basename.includes('.fixture.')) {
            if (!basename.match(/^[a-z][a-z0-9-]*\.fixture\.ts$/)) {
              context.report({
                node,
                messageId: 'coreFixtureNaming',
                data: { filename: basename },
              })
            }
            return
          }

          // Hooks: useCamelCase.ts
          if (relativePath.includes('/hooks/')) {
            if (!basename.match(/^use[A-Z][a-zA-Z0-9]*\.(ts|tsx)$/)) {
              context.report({
                node,
                messageId: 'uiHookNaming',
                data: { filename: basename },
              })
            }
          }
          // View models: kebab-case.view-model.ts
          else if (basename.includes('.view-model.')) {
            if (isTestFile) {
              if (!basename.match(/^[a-z][a-z0-9-]*\.view-model\.test\.ts$/)) {
                context.report({
                  node,
                  messageId: 'uiViewModelNaming',
                  data: { filename: basename },
                })
              }
            } else if (!basename.match(/^[a-z][a-z0-9-]*\.view-model\.ts$/)) {
              context.report({
                node,
                messageId: 'uiViewModelNaming',
                data: { filename: basename },
              })
            }
          }
          // Schemas: kebab-case.schema.ts
          else if (basename.includes('.schema.')) {
            if (isTestFile) {
              if (!basename.match(/^[a-z][a-z0-9-]*\.schema\.test\.ts$/)) {
                context.report({
                  node,
                  messageId: 'uiSchemaNaming',
                  data: { filename: basename },
                })
              }
            } else if (!basename.match(/^[a-z][a-z0-9-]*\.schema\.ts$/)) {
              context.report({
                node,
                messageId: 'uiSchemaNaming',
                data: { filename: basename },
              })
            }
          }
          // React components (.tsx files in ui/ that are not in special folders)
          else if (
            isTsx &&
            !relativePath.includes('/hooks/') &&
            !relativePath.includes('/schemas/') &&
            !relativePath.includes('/utils/')
          ) {
            // Components should be PascalCase
            if (!baseName.match(/^[A-Z][a-zA-Z0-9]*$/)) {
              context.report({
                node,
                messageId: 'uiComponentNaming',
                data: { filename: basename },
              })
            }
          }
          // Utils folder: allow camelCase or kebab-case for both .ts and .tsx (utility functions)
          else if (relativePath.includes('/utils/')) {
            // Allow camelCase (e.g., handleUIError.tsx, timeFormat.ts) or kebab-case
            if (!isCamelCase(baseName) && !isKebabCase(baseName)) {
              context.report({
                node,
                messageId: 'uiUtilityNaming',
                data: { filename: basename },
              })
            }
          }
          // Other non-component .ts files can be:
          // - PascalCase for type/enum files (e.g., SessionType.ts, TabScreens.ts)
          // - camelCase for function/utility files (e.g., assertIsBlockSession.ts, preloadedStateForManualTesting.ts)
          // - kebab-case for utilities (e.g., auth-schemas.ts, validation-helper.ts, exhaustive-guard.ts)
          else if (
            isTs &&
            !basename.includes('.type.') &&
            !basename.includes('.types.') &&
            !basename.includes('.view-model.') &&
            !basename.includes('.schema.') &&
            !isTestFile
          ) {
            // Allow PascalCase, camelCase, or kebab-case
            const isValidPascalCase = isPascalCase(baseName)
            const isValidCamelCase = isCamelCase(baseName)
            const isValidKebabCase = isKebabCase(baseName)
            if (!isValidPascalCase && !isValidCamelCase && !isValidKebabCase) {
              context.report({
                node,
                messageId: 'uiUtilityNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // ==========================================
        // APP LAYER RULES (Expo Router)
        // ==========================================

        if (relativePath.includes('/app/') && !relativePath.includes('/node_modules/')) {
          // Special Expo Router files
          const specialFiles = ['_layout.tsx', 'index.tsx', '+html.tsx', '+not-found.tsx']
          const isSpecialFile = specialFiles.includes(basename)

          // Dynamic routes: [param].tsx or [...param].tsx
          const isDynamicRoute = basename.match(/^\[.*\]\.tsx$/)

          // Route groups: (name)/
          const isInRouteGroup = relativePath.match(/\/\([a-z-]+\)\//)

          if (isTsx && !isSpecialFile && !isDynamicRoute) {
            // Regular routes should be kebab-case
            if (!baseName.match(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)) {
              context.report({
                node,
                messageId: 'appRouteNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // ==========================================
        // FOLDER STRUCTURE RULES
        // ==========================================

        // UI screen folders must be PascalCase
        if (relativePath.includes('/ui/screens/')) {
          // Extract the screen folder name (first folder after /screens/)
          const screenMatch = relativePath.match(/\/ui\/screens\/([^/]+)/)
          if (screenMatch) {
            const screenFolder = screenMatch[1]
            // Screen folders should be PascalCase (e.g., Home, Blocklists, StrictMode)
            if (!isPascalCase(screenFolder)) {
              context.report({
                node,
                messageId: 'uiScreenFolderNaming',
                data: { filename: basename, folder: screenFolder },
              })
            }
          }
        }

        // Infra folders must be kebab-case
        if (relativePath.includes('/infra/')) {
          // Extract the infra subfolder name
          const infraMatch = relativePath.match(/\/infra\/([^/]+)/)
          if (infraMatch) {
            const infraFolder = infraMatch[1]
            // Skip special folders
            if (!infraFolder.startsWith('__')) {
              // Infra folders should be kebab-case (e.g., block-session-repository, auth-gateway)
              if (!isKebabCase(infraFolder)) {
                context.report({
                  node,
                  messageId: 'infraFolderNaming',
                  data: { folder: infraFolder },
                })
              }
            }
          }
        }

        // Core domain folders must be kebab-case (except special folders)
        if (relativePath.includes('/core/')) {
          // Extract the domain folder name
          const coreMatch = relativePath.match(/\/core\/([^/]+)/)
          if (coreMatch) {
            const coreFolder = coreMatch[1]
            // Special folders use underscore prefix
            const isSpecialFolder = coreFolder.startsWith('_') || coreFolder.startsWith('__')
            if (!isSpecialFolder) {
              // Domain folders should be kebab-case (e.g., block-session, auth, strict-mode)
              if (!isKebabCase(coreFolder)) {
                context.report({
                  node,
                  messageId: 'coreSpecialFolderNaming',
                  data: { folder: coreFolder },
                })
              }
            }
          }
        }
      },
    }
  },
}
