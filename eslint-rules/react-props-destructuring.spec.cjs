/**
 * @fileoverview Tests for react-props-destructuring rule
 */

const { RuleTester } = require('eslint')
const rule = require('./react-props-destructuring.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

ruleTester.run('react-props-destructuring', rule, {
  valid: [
    // Correct: destructured props with extracted type
    {
      code: `
type ButtonProps = { label: string }
function Button({ label }: ButtonProps) {
  return <button>{label}</button>
}
      `,
    },
    // Correct: destructured props with Readonly extracted type
    {
      code: `
type CardProps = Readonly<{ title: string }>
function Card({ title }: CardProps) {
  return <div>{title}</div>
}
      `,
    },
    // Correct: multiple props destructured
    {
      code: `
type FormProps = { name: string; value: number }
function Form({ name, value }: FormProps) {
  return <form />
}
      `,
    },
    // Not a component (lowercase) - should not report
    {
      code: `
function helper(props: { x: number }) {
  return props.x
}
      `,
    },
    // No props parameter - should not report
    {
      code: `
function EmptyComponent() {
  return <div />
}
      `,
    },
  ],

  invalid: [
    // Bad: props parameter with inline type (not destructured) - with fix including body
    {
      code: `function BlocklistCard(props: { name: string }) {
  return <div>{props.name}</div>
}`,
      output: `type BlocklistCardProps = { name: string }

function BlocklistCard({ name }: BlocklistCardProps) {
  return <div>{name}</div>
}`,
      errors: [
        {
          messageId: 'destructureProps',
          data: { componentName: 'BlocklistCard', suggestedProps: 'name' },
        },
      ],
    },
    // Bad: props parameter with Readonly inline type - with fix including body
    {
      code: `function UserCard(props: Readonly<{ username: string }>) {
  return <span>{props.username}</span>
}`,
      output: `type UserCardProps = Readonly<{ username: string }>

function UserCard({ username }: UserCardProps) {
  return <span>{username}</span>
}`,
      errors: [
        {
          messageId: 'destructureProps',
          data: { componentName: 'UserCard', suggestedProps: 'username' },
        },
      ],
    },
    // Bad: destructured but with inline type - with fix
    {
      code: `function Avatar({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} />
}`,
      output: `type AvatarProps = { src: string; alt: string }

function Avatar({ src, alt }: AvatarProps) {
  return <img src={src} alt={alt} />
}`,
      errors: [
        {
          messageId: 'extractPropsType',
          data: { componentName: 'Avatar' },
        },
      ],
    },
    // Bad: destructured but with Readonly inline type - with fix
    {
      code: `function Badge({ count }: Readonly<{ count: number }>) {
  return <span>{count}</span>
}`,
      output: `type BadgeProps = Readonly<{ count: number }>

function Badge({ count }: BadgeProps) {
  return <span>{count}</span>
}`,
      errors: [
        {
          messageId: 'extractPropsType',
          data: { componentName: 'Badge' },
        },
      ],
    },
    // Bad: multiple props not destructured - with fix
    {
      code: `function DataCard(props: { id: string; value: number; label: string }) {
  return <div />
}`,
      output: `type DataCardProps = { id: string; value: number; label: string }

function DataCard({ id, value, label }: DataCardProps) {
  return <div />
}`,
      errors: [
        {
          messageId: 'destructureProps',
          data: { componentName: 'DataCard', suggestedProps: 'id, value, label' },
        },
      ],
    },
    // Bad: props with named type but still not destructured - no auto-fix (can't determine props)
    {
      code: `type MyComponentProps = { foo: string }
function MyComponent(props: MyComponentProps) {
  return <div>{props.foo}</div>
}`,
      // No output - can't auto-fix when type is a reference (don't know property names)
      output: null,
      errors: [
        {
          messageId: 'destructureProps',
          data: { componentName: 'MyComponent', suggestedProps: '...' },
        },
      ],
    },
    // Bad: exported function with inline props - with fix
    {
      code: `export function Modal({ visible }: { visible: boolean }) {
  return <div />
}`,
      output: `type ModalProps = { visible: boolean }

export function Modal({ visible }: ModalProps) {
  return <div />
}`,
      errors: [
        {
          messageId: 'extractPropsType',
          data: { componentName: 'Modal' },
        },
      ],
    },
  ],
})
