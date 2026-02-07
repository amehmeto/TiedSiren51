/**
 * @fileoverview Tests for no-i-prefix-in-imports rule
 */

const { RuleTester } = require('eslint')
const rule = require('./no-i-prefix-in-imports.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('no-i-prefix-in-imports', rule, {
  valid: [
    // No alias - OK
    {
      code: `import { Foo } from './foo'`,
    },
    // Non-I-prefix alias - OK
    {
      code: `import { Foo as FooPort } from './foo'`,
    },
    // Descriptive alias - OK
    {
      code: `import { Logger as ConsoleLogger } from './logger'`,
    },
    // Lowercase 'i' prefix is OK (not Hungarian notation)
    {
      code: `import { Foo as internalFoo } from './foo'`,
    },
    // Just 'I' alone is OK
    {
      code: `import { Foo as I } from './foo'`,
    },
    // Default import - OK (not affected)
    {
      code: `import IFoo from './foo'`,
    },
    // Namespace import - OK (not affected)
    {
      code: `import * as IFoo from './foo'`,
    },
  ],

  invalid: [
    // I-prefix alias - NOT OK
    {
      code: `import { Foo as IFoo } from './foo'`,
      errors: [
        {
          messageId: 'noIPrefixInImport',
          data: { alias: 'IFoo' },
        },
      ],
    },
    // I-prefix with longer name - NOT OK
    {
      code: `import { AuthGateway as IAuthGateway } from './auth.gateway'`,
      errors: [
        {
          messageId: 'noIPrefixInImport',
          data: { alias: 'IAuthGateway' },
        },
      ],
    },
    // Multiple I-prefix imports - NOT OK
    {
      code: `import { Foo as IFoo, Bar as IBar } from './types'`,
      errors: [
        { messageId: 'noIPrefixInImport', data: { alias: 'IFoo' } },
        { messageId: 'noIPrefixInImport', data: { alias: 'IBar' } },
      ],
    },
    // I-prefix with Repository - NOT OK
    {
      code: `import { BlockSessionRepository as IBlockSessionRepository } from './ports'`,
      errors: [
        {
          messageId: 'noIPrefixInImport',
          data: { alias: 'IBlockSessionRepository' },
        },
      ],
    },
  ],
})
