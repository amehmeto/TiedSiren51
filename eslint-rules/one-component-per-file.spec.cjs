/**
 * @fileoverview Tests for one-component-per-file rule
 */

const { RuleTester } = require('eslint')
const rule = require('./one-component-per-file.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
})

ruleTester.run('one-component-per-file', rule, {
  valid: [
    // Single component - VALID
    {
      code: `
        function MyComponent() {
          return <div>Hello</div>
        }
      `,
    },
    // Single arrow function component - VALID
    {
      code: `
        const MyComponent = () => {
          return <div>Hello</div>
        }
      `,
    },
    // Component with helper function (not PascalCase) - VALID
    {
      code: `
        function formatDate(date) {
          return date.toISOString()
        }

        function MyComponent() {
          return <div>{formatDate(new Date())}</div>
        }
      `,
    },
    // Component with helper function returning string - VALID
    {
      code: `
        function GetTitle() {
          return "Hello"
        }

        function MyComponent() {
          return <div>{GetTitle()}</div>
        }
      `,
    },
    // No components, just utilities - VALID
    {
      code: `
        function add(a, b) {
          return a + b
        }

        const multiply = (a, b) => a * b
      `,
    },
    // Single exported component with types - VALID
    {
      code: `
        export function Button() {
          return <button>Click me</button>
        }
      `,
    },
  ],

  invalid: [
    // Two function components - INVALID
    {
      code: `
        function ComponentA() {
          return <div>A</div>
        }

        function ComponentB() {
          return <div>B</div>
        }
      `,
      errors: [
        {
          messageId: 'multipleComponents',
          data: {
            components: 'ComponentA, ComponentB',
            extra: 'ComponentB',
          },
        },
      ],
    },
    // Mixed function and arrow components - INVALID
    {
      code: `
        function MainComponent() {
          return <div>Main</div>
        }

        const HelperComponent = () => <span>Helper</span>
      `,
      errors: [
        {
          messageId: 'multipleComponents',
          data: {
            components: 'MainComponent, HelperComponent',
            extra: 'HelperComponent',
          },
        },
      ],
    },
    // Three components - INVALID (reports on 2nd and 3rd)
    {
      code: `
        function First() {
          return <div>1</div>
        }

        function Second() {
          return <div>2</div>
        }

        function Third() {
          return <div>3</div>
        }
      `,
      errors: [
        {
          messageId: 'multipleComponents',
          data: {
            components: 'First, Second, Third',
            extra: 'Second',
          },
        },
        {
          messageId: 'multipleComponents',
          data: {
            components: 'First, Second, Third',
            extra: 'Third',
          },
        },
      ],
    },
    // Real-world case: Menu with MenuOption - INVALID
    {
      code: `
        function MenuOption({ name }) {
          return <div>{name}</div>
        }

        function ThreeDotMenu({ options }) {
          return (
            <div>
              {options.map(o => <MenuOption key={o.name} name={o.name} />)}
            </div>
          )
        }
      `,
      errors: [
        {
          messageId: 'multipleComponents',
          data: {
            components: 'MenuOption, ThreeDotMenu',
            extra: 'ThreeDotMenu',
          },
        },
      ],
    },
  ],
})
