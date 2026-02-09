/**
 * @fileoverview Tests for no-module-level-constants rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-module-level-constants.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

describe('no-module-level-constants', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-module-level-constants', rule, {
      valid: [
        // Constants inside a class - OK
        {
          code: `
        class MyService {
          static MAX_RETRIES = 3
          private timeout = 1000
        }
      `,
          filename: '/project/infra/auth/auth.gateway.ts',
        },
        // Constants in test files - OK
        {
          code: `const MOCK_USER = { id: '123' }`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Constants in fixture files - OK
        {
          code: `const DEFAULT_SESSION = {}`,
          filename: '/project/core/auth/auth.fixture.ts',
        },
        // Constants in constants files - OK
        {
          code: `const API_URL = 'https://api.example.com'`,
          filename: '/project/core/__constants__/api.ts',
        },
        // Constants in config files - OK
        {
          code: `const config = { timeout: 5000 }`,
          filename: '/project/infra/firebaseConfig.ts',
        },
        // Constants in builder files - OK
        {
          code: `const DEFAULT_NAME = 'Test Session'`,
          filename: '/project/tests/builders/session.builder.ts',
        },
        // Constants in _tests_ directory - OK
        {
          code: `const testStore = createTestStore()`,
          filename: '/project/core/_tests_/store.ts',
        },
        // Constants in slice files (Redux pattern) - OK
        {
          code: `const initialState = {}`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Constants in schema files - OK
        {
          code: `const schema = z.object({})`,
          filename: '/project/ui/schemas/auth.schema.ts',
        },
        // Constants in view-model files - OK
        {
          code: `const helper = () => {}`,
          filename: '/project/ui/screens/Home/home.view-model.ts',
        },
        // Constants in utils files - OK
        {
          code: `const helper = () => {}`,
          filename: '/project/core/__utils__/date.utils.ts',
        },
        // Constants in selectors - OK
        {
          code: `const selectUser = (state) => state.user`,
          filename: '/project/core/auth/selectors/selectUser.ts',
        },
        // styles constant (React Native pattern) - OK
        {
          code: `const styles = StyleSheet.create({})`,
          filename: '/project/ui/components/Button.tsx',
        },
        // Pattern/regex constants - OK
        {
          code: `const EMAIL_PATTERN = /^[^@]+@[^@]+$/`,
          filename: '/project/core/auth/validators.ts',
        },
        // TSX files (components) - OK
        {
          code: `const COLORS = ['red', 'blue']`,
          filename: '/project/ui/components/ColorPicker.tsx',
        },
        // JS/CJS/MJS files - OK
        {
          code: `const config = {}`,
          filename: '/project/scripts/build.js',
        },
        // CJS files - OK
        {
          code: `const config = {}`,
          filename: '/project/eslint-rules/my-rule.cjs',
        },
        // MJS files - OK
        {
          code: `const config = {}`,
          filename: '/project/scripts/build.mjs',
        },
        // dependencies.ts files (DI containers) - OK
        {
          code: `const container = {}`,
          filename: '/project/core/dependencies.ts',
        },
        // var declarations - OK (skipped, only const/let are checked)
        {
          code: `var legacy = 'old'`,
          filename: '/project/infra/auth/auth.gateway.ts',
        },
        // styles constant in non-TSX file - OK
        {
          code: `const styles = { container: {} }`,
          filename: '/project/infra/auth/auth.gateway.ts',
        },
        // Constant inside a function (not module-level) - OK
        {
          code: `function foo() { const LOCAL = 'value' }`,
          filename: '/project/infra/auth/auth.gateway.ts',
        },
        // _REGEX pattern constants - OK
        {
          code: `const PHONE_REGEX = /^\\d{10}$/`,
          filename: '/project/core/auth/validators.ts',
        },
      ],

      invalid: [
        // Module-level constant in .ts file - NOT OK
        {
          code: `const MAX_RETRIES = 3`,
          filename: '/project/infra/auth/firebase.auth.gateway.ts',
          errors: [
            {
              messageId: 'noModuleLevelConstant',
              data: { name: 'MAX_RETRIES' },
            },
          ],
        },
        // Multiple module-level constants - NOT OK
        {
          code: `
        const TIMEOUT = 5000
        const MAX_RETRIES = 3
      `,
          filename: '/project/infra/api/api.service.ts',
          errors: [
            { messageId: 'noModuleLevelConstant', data: { name: 'TIMEOUT' } },
            {
              messageId: 'noModuleLevelConstant',
              data: { name: 'MAX_RETRIES' },
            },
          ],
        },
        // let declaration - NOT OK
        {
          code: `let counter = 0`,
          filename: '/project/infra/auth/auth.gateway.ts',
          errors: [
            {
              messageId: 'noModuleLevelConstant',
              data: { name: 'counter' },
            },
          ],
        },
        // Destructuring - NOT OK
        {
          code: `const { apiKey, secret } = config`,
          filename: '/project/infra/auth/auth.gateway.ts',
          errors: [
            { messageId: 'noModuleLevelConstant', data: { name: 'apiKey' } },
            { messageId: 'noModuleLevelConstant', data: { name: 'secret' } },
          ],
        },
        // Array destructuring - NOT OK
        {
          code: `const [first, second] = items`,
          filename: '/project/infra/auth/auth.gateway.ts',
          errors: [
            { messageId: 'noModuleLevelConstant', data: { name: 'first' } },
            { messageId: 'noModuleLevelConstant', data: { name: 'second' } },
          ],
        },
      ],
    })
  })
})
