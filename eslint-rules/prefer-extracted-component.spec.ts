/**
 * @fileoverview Tests for prefer-extracted-component rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-extracted-component.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('prefer-extracted-component', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-extracted-component', rule, {
      valid: [
        // Short element — under line threshold
        {
          code: `
function MyComponent() {
  return (
    <Wrapper onPress={handler}>
      <Text>Hello</Text>
    </Wrapper>
  )
}`,
        },
        // Many dynamic props — not boilerplate
        {
          code: `
function MyComponent() {
  const content = (
    <Pressable
      onPress={onPress}
      style={dynamicStyle}
      hitSlop={hitSlop}
      testID={testID}
      disabled={isDisabled}
      accessibilityLabel={label}
      accessibilityHint={hint}
      onLongPress={onLongPress}
    >
      <Text>Content</Text>
    </Pressable>
  )
  return content
}`,
        },
        // Root return JSX — this IS the component, should not be flagged
        {
          code: `
function MyComponent() {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel="tap me"
    >
      <Text>Content</Text>
    </Pressable>
  )
}`,
        },
        // No children — leaf element, not a wrapper
        {
          code: `
function MyComponent() {
  const icon = (
    <Ionicons
      name="chevron-forward"
      size={24}
      color="grey"
      style={{ marginRight: 8 }}
      accessibilityRole="image"
      accessibilityLabel="arrow"
      testID="icon"
    />
  )
  return <View>{icon}</View>
}`,
        },
        // styles.x treated as static — 4 identifiers + styles.x = 4 dynamic, over threshold
        {
          code: `
function MyComponent() {
  const content = (
    <Pressable
      onPress={onPress}
      style={styles.container}
      hitSlop={hitSlop}
      testID={testID}
      disabled={isDisabled}
      accessibilityLabel="tap"
      accessibilityHint="press"
    >
      <Text>Content</Text>
    </Pressable>
  )
  return content
}`,
        },
        // Short opening tag with many children — line count from children, not props
        {
          code: `
function SettingsScreen() {
  const section = (
    <SettingsSection title="Account">
      <SettingsRow
        label={email}
        icon="mail-outline"
        hasDivider
        accessibilityLabel="Email"
      />
      <SettingsRow
        label={provider}
        icon="key-outline"
        accessibilityLabel="Provider"
      />
    </SettingsSection>
  )
  return section
}`,
        },
        // Outside component function — not relevant
        {
          code: `
function helperFunction() {
  const el = (
    <Pressable
      onPress={handler}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel="tap me"
    >
      <Text>Content</Text>
    </Pressable>
  )
  return el
}`,
        },
      ],

      invalid: [
        // Classic case: Pressable wrapper with mostly static props
        {
          code: `
function MyComponent() {
  const content = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel="tap me"
    >
      <Text>Content</Text>
    </Pressable>
  )
  return content
}`,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Large wrapper View with only 1 dynamic prop
        {
          code: `
function SettingsRow() {
  const wrapped = (
    <View
      style={computedStyle}
      accessibilityRole="none"
      importantForAccessibility="no"
      pointerEvents="box-none"
      collapsable={false}
      needsOffscreenAlphaCompositing={false}
      removeClippedSubviews={false}
    >
      <Text>Hello</Text>
    </View>
  )
  return wrapped
}`,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Works with arrow component
        {
          code: `
const MyComponent = () => {
  const wrapped = (
    <Pressable
      onPress={handler}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel="tap"
    >
      <Text>Click</Text>
    </Pressable>
  )
  return wrapped
}`,
          errors: [{ messageId: 'extractComponent' }],
        },
        // styles.x treated as static — only 1 dynamic prop (onPress), flagged
        {
          code: `
function MyComponent() {
  const wrapped = (
    <View
      style={styles.container}
      onPress={onPress}
      accessibilityRole="none"
      pointerEvents="box-none"
      collapsable={false}
      hitSlop={T.spacing.small}
    >
      <Text>Hello</Text>
    </View>
  )
  return wrapped
}`,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Ternary branch in return — conditional branches should be flagged
        {
          code: `
function SettingsRow({ onPress }) {
  const content = <Text>Hello</Text>

  return onPress ? (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel="tap me"
    >
      {content}
    </Pressable>
  ) : (
    <View>{content}</View>
  )
}`,
          errors: [{ messageId: 'extractComponent' }],
        },
      ],
    })
  })
})
