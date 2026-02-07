/**
 * @fileoverview Tests for no-adapter-in-ui rule
 */

const { RuleTester } = require('eslint')
const rule = require('./no-adapter-in-ui.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('no-adapter-in-ui', rule, {
  valid: [
    // Using selector instead of adapter - OK
    {
      code: `import { selectBlocklists } from '@core/blocklist/selectors/selectBlocklists'`,
      filename: '/project/ui/screens/Home/HomeScreen.tsx',
    },
    // Non-adapter import - OK
    {
      code: `import { BlockSession } from '@core/block-session/block-session'`,
      filename: '/project/ui/screens/Home/HomeScreen.tsx',
    },
    // Adapter in core - OK
    {
      code: `import { blocklistAdapter } from './blocklist.adapter'`,
      filename: '/project/core/blocklist/blocklist.slice.ts',
    },
    // Adapter in infra - OK
    {
      code: `import { blocklistAdapter } from '@core/blocklist/blocklist.adapter'`,
      filename: '/project/infra/blocklist-repository/prisma.blocklist.repository.ts',
    },
    // Test file in ui - should not apply
    {
      code: `import { blocklistAdapter } from '@core/blocklist'`,
      filename: '/project/ui/screens/Home/HomeScreen.test.tsx',
    },
    // Spec file in ui - should not apply
    {
      code: `import { blocklistAdapter } from '@core/blocklist'`,
      filename: '/project/ui/screens/Home/HomeScreen.spec.tsx',
    },
    // Not in ui or app layer - should not apply
    {
      code: `import { blocklistAdapter } from './blocklist'`,
      filename: '/project/core/blocklist/blocklist.slice.ts',
    },
  ],

  invalid: [
    // Importing adapter in ui - NOT OK
    {
      code: `import { blocklistAdapter } from '@core/blocklist'`,
      filename: '/project/ui/screens/Home/HomeScreen.tsx',
      errors: [
        {
          messageId: 'noAdapterInUi',
          data: { adapterName: 'blocklistAdapter' },
        },
      ],
    },
    // Importing adapter in app - NOT OK
    {
      code: `import { sessionAdapter } from '@core/block-session'`,
      filename: '/project/app/(tabs)/home.tsx',
      errors: [
        {
          messageId: 'noAdapterInUi',
          data: { adapterName: 'sessionAdapter' },
        },
      ],
    },
    // Using adapter method in ui - NOT OK
    {
      code: `const selectors = blocklistAdapter.getSelectors()`,
      filename: '/project/ui/screens/Home/HomeScreen.tsx',
      errors: [
        {
          messageId: 'noAdapterInUi',
          data: { adapterName: 'blocklistAdapter' },
        },
      ],
    },
    // Multiple adapter imports - NOT OK
    {
      code: `import { blocklistAdapter, sirenAdapter } from '@core/adapters'`,
      filename: '/project/ui/components/List.tsx',
      errors: [
        { messageId: 'noAdapterInUi', data: { adapterName: 'blocklistAdapter' } },
        { messageId: 'noAdapterInUi', data: { adapterName: 'sirenAdapter' } },
      ],
    },
  ],
})
