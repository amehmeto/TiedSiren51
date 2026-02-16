/**
 * @fileoverview Tests for no-selector-prop-drilling rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-selector-prop-drilling.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('no-selector-prop-drilling', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-selector-prop-drilling', rule, {
      valid: [
        // useSelector result used in JSX text children only
        {
          code: `
            function Parent() {
              const value = useSelector((s) => selectFoo(s))
              return <div>{value}</div>
            }
          `,
        },
        // Non-useSelector hook result passed as prop
        {
          code: `
            function Parent() {
              const [count, setCount] = useState(0)
              return <Child count={count} />
            }
          `,
        },
        // useSelector result on intrinsic element
        {
          code: `
            function Parent() {
              const value = useSelector((s) => selectFoo(s))
              return <div data-value={value} />
            }
          `,
        },
        // Computed value derived from useSelector result
        {
          code: `
            function Parent() {
              const count = useSelector((s) => selectCount(s))
              const doubled = count * 2
              return <Child value={doubled} />
            }
          `,
        },
        // String literal prop
        {
          code: `
            function Parent() {
              return <Child value="hello" />
            }
          `,
        },
        // Number literal prop
        {
          code: `
            function Parent() {
              return <Child value={42} />
            }
          `,
        },
        // useState result passed as prop (not useSelector)
        {
          code: `
            function Parent() {
              const value = useState('foo')
              return <Child value={value} />
            }
          `,
        },
        // useSelector result used locally, not as prop
        {
          code: `
            function Parent() {
              const isActive = useSelector((s) => selectIsActive(s))
              if (isActive) return null
              return <Child />
            }
          `,
        },
        // Passed to a function call, not JSX
        {
          code: `
            function Parent() {
              const value = useSelector((s) => selectFoo(s))
              doSomething(value)
              return <Child />
            }
          `,
        },
        // Member expression call - not a simple useSelector call
        {
          code: `
            function Parent() {
              const value = store.useSelector((s) => selectFoo(s))
              return <Child value={value} />
            }
          `,
        },
        // Destructuring with rest element only (RestElement, not Property)
        {
          code: `
            function Parent() {
              const { ...rest } = useSelector((s) => selectData(s))
              return <Child rest={rest} />
            }
          `,
        },
        // Ignored component (FlatList) - should not report
        {
          code: `
            function Parent() {
              const data = useSelector((s) => selectItems(s))
              return <FlatList data={data} />
            }
          `,
          options: [{ ignoredComponents: ['FlatList'] }],
        },
        // Expression in JSX children (not attribute)
        {
          code: `
            function Parent() {
              const text = useSelector((s) => selectText(s))
              return <Child>{text}</Child>
            }
          `,
        },
        // Non-identifier expression in JSX attribute (object literal)
        {
          code: `
            function Parent() {
              return <Child style={{ color: 'red' }} />
            }
          `,
        },
      ],
      invalid: [
        // Basic: simple variable from useSelector passed as prop
        {
          code: `
            function Parent() {
              const value = useSelector((s) => selectFoo(s))
              return <Child value={value} />
            }
          `,
          errors: [
            {
              messageId: 'noSelectorPropDrilling',
              data: { variable: 'value', prop: 'value' },
            },
          ],
        },
        // Named selector with boolean
        {
          code: `
            function Parent() {
              const isActive = useSelector((s) => selectIsActive(s))
              return <Badge isActive={isActive} />
            }
          `,
          errors: [
            {
              messageId: 'noSelectorPropDrilling',
              data: { variable: 'isActive', prop: 'isActive' },
            },
          ],
        },
        // Multiple props from different useSelector calls
        {
          code: `
            function Parent() {
              const name = useSelector((s) => selectName(s))
              const age = useSelector((s) => selectAge(s))
              return <Profile name={name} age={age} />
            }
          `,
          errors: [
            {
              messageId: 'noSelectorPropDrilling',
              data: { variable: 'name', prop: 'name' },
            },
            {
              messageId: 'noSelectorPropDrilling',
              data: { variable: 'age', prop: 'age' },
            },
          ],
        },
        // Destructured useSelector result
        {
          code: `
            function Parent() {
              const { name } = useSelector((s) => selectUser(s))
              return <Info name={name} />
            }
          `,
          errors: [
            {
              messageId: 'noSelectorPropDrilling',
              data: { variable: 'name', prop: 'name' },
            },
          ],
        },
        // Destructured with rename
        {
          code: `
            function Parent() {
              const { a: b } = useSelector((s) => selectData(s))
              return <C b={b} />
            }
          `,
          errors: [
            {
              messageId: 'noSelectorPropDrilling',
              data: { variable: 'b', prop: 'b' },
            },
          ],
        },
        // JSXMemberExpression (namespaced component)
        {
          code: `
            function Parent() {
              const value = useSelector((s) => selectFoo(s))
              return <NS.Child value={value} />
            }
          `,
          errors: [
            {
              messageId: 'noSelectorPropDrilling',
              data: { variable: 'value', prop: 'value' },
            },
          ],
        },
      ],
    })
  })
})
