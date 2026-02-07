/**
 * @fileoverview Tests for fixture-matches-filename rule
 */

const { RuleTester } = require('eslint')
const rule = require('./fixture-matches-filename.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('fixture-matches-filename', rule, {
  valid: [
    // Pattern 1: camelCase + Fixture (authFixture)
    {
      code: `export const authFixture = { user: 'test' }`,
      filename: '/project/tests/fixtures/auth.fixture.ts',
    },
    // Pattern 2: create + PascalCase + Fixture (createAuthFixture)
    {
      code: `export const createAuthFixture = () => ({ user: 'test' })`,
      filename: '/project/tests/fixtures/auth.fixture.ts',
    },
    // Function export
    {
      code: `export function blockSessionFixture() { return {} }`,
      filename: '/project/tests/fixtures/block-session.fixture.ts',
    },
    // Named export via object
    {
      code: `const blocklistFixture = {}; export { blocklistFixture }`,
      filename: '/project/tests/fixtures/blocklist.fixture.ts',
    },
    // Multi-word kebab-case with camelCase pattern
    {
      code: `export const blockFormDataFixture = {}`,
      filename: '/project/tests/fixtures/block-form-data.fixture.ts',
    },
    // Multi-word kebab-case with create pattern
    {
      code: `export const createBlockFormDataFixture = () => ({})`,
      filename: '/project/tests/fixtures/block-form-data.fixture.ts',
    },
    // Non-fixture file - should not apply
    {
      code: `export const something = {}`,
      filename: '/project/src/utils.ts',
    },
    // node_modules - should skip
    {
      code: `export const wrong = {}`,
      filename: '/project/node_modules/package/file.fixture.ts',
    },
  ],

  invalid: [
    // Wrong export name
    {
      code: `export const wrongName = {}`,
      filename: '/project/tests/fixtures/auth.fixture.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'auth.fixture.ts',
            expectedName1: 'authFixture',
            expectedName2: 'createAuthFixture',
            foundExports: 'wrongName',
          },
        },
      ],
    },
    // Missing export entirely
    {
      code: `const authFixture = {}`,
      filename: '/project/tests/fixtures/auth.fixture.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'auth.fixture.ts',
            expectedName1: 'authFixture',
            expectedName2: 'createAuthFixture',
            foundExports: 'none',
          },
        },
      ],
    },
    // Multiple exports but not the expected one
    {
      code: `
        export const helper = {}
        export const otherFixture = {}
      `,
      filename: '/project/tests/fixtures/siren.fixture.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'siren.fixture.ts',
            expectedName1: 'sirenFixture',
            expectedName2: 'createSirenFixture',
            foundExports: 'helper, otherFixture',
          },
        },
      ],
    },
  ],
})
