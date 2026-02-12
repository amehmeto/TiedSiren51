/**
 * @fileoverview Tests for no-icon-size-magic-numbers rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-icon-size-magic-numbers.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('no-icon-size-magic-numbers', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-icon-size-magic-numbers', rule, {
      valid: [
        // Using theme constant - OK
        {
          code: `
        import { Ionicons } from '@expo/vector-icons'
        const Icon = () => <Ionicons name="home" size={T.icon.size.medium} />
      `,
        },
        // Using variable - OK
        {
          code: `
        import { Ionicons } from '@expo/vector-icons'
        const iconSize = 24
        const Icon = () => <Ionicons name="home" size={iconSize} />
      `,
        },
        // No size prop - OK
        {
          code: `
        import { Ionicons } from '@expo/vector-icons'
        const Icon = () => <Ionicons name="home" />
      `,
        },
        // Non-icon component - OK
        {
          code: `
        import { View } from 'react-native'
        const Component = () => <View size={24} />
      `,
        },
        // Icon not from @expo/vector-icons - OK
        {
          code: `
        import { CustomIcon } from './icons'
        const Icon = () => <CustomIcon name="home" size={24} />
      `,
        },
        // Default import from subpath - OK with variable
        {
          code: `
        import Ionicons from '@expo/vector-icons/Ionicons'
        const size = 24
        const Icon = () => <Ionicons name="home" size={size} />
      `,
        },
      ],

      invalid: [
        // Magic number in size prop
        {
          code: `
        import { Ionicons } from '@expo/vector-icons'
        const Icon = () => <Ionicons name="home" size={24} />
      `,
          errors: [
            {
              messageId: 'noMagicIconSize',
              data: { value: 24 },
            },
          ],
        },
        // Different icon from @expo/vector-icons
        {
          code: `
        import { MaterialIcons } from '@expo/vector-icons'
        const Icon = () => <MaterialIcons name="home" size={28} />
      `,
          errors: [
            {
              messageId: 'noMagicIconSize',
              data: { value: 28 },
            },
          ],
        },
        // Multiple icons with magic numbers
        {
          code: `
        import { Ionicons, MaterialIcons } from '@expo/vector-icons'
        const Icons = () => (
          <>
            <Ionicons name="home" size={24} />
            <MaterialIcons name="settings" size={32} />
          </>
        )
      `,
          errors: [
            { messageId: 'noMagicIconSize', data: { value: 24 } },
            { messageId: 'noMagicIconSize', data: { value: 32 } },
          ],
        },
        // Default import from subpath with magic number
        {
          code: `
        import Ionicons from '@expo/vector-icons/Ionicons'
        const Icon = () => <Ionicons name="home" size={20} />
      `,
          errors: [
            {
              messageId: 'noMagicIconSize',
              data: { value: 20 },
            },
          ],
        },
      ],
    })
  })
})
