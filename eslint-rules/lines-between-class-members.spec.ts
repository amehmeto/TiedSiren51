/**
 * @fileoverview Tests for lines-between-class-members rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./lines-between-class-members.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

describe('lines-between-class-members', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('lines-between-class-members', rule, {
      valid: [
        // Single-line members without blank line - OK
        {
          code: `
class Foo {
  a = 1
  b = 2
  c = 3
}
`,
        },
        // Multi-line method with blank line before next member - OK
        {
          code: `
class Foo {
  a = 1

  method() {
    return this.a
  }

  b = 2
}
`,
        },
        // Two multi-line methods with blank line between - OK
        {
          code: `
class Foo {
  methodA() {
    return 1
  }

  methodB() {
    return 2
  }
}
`,
        },
        // Single member class - OK
        {
          code: `
class Foo {
  a = 1
}
`,
        },
      ],

      invalid: [
        // Multi-line method without blank line before next member - NOT OK
        {
          code: `
class Foo {
  method() {
    return 1
  }
  b = 2
}
`,
          output: `
class Foo {
  method() {
    return 1
  }
  \nb = 2
}
`,
          errors: [{ messageId: 'missing' }],
        },
        // Two multi-line methods without blank line - NOT OK
        {
          code: `
class Foo {
  methodA() {
    return 1
  }
  methodB() {
    return 2
  }
}
`,
          output: `
class Foo {
  methodA() {
    return 1
  }
  \nmethodB() {
    return 2
  }
}
`,
          errors: [{ messageId: 'missing' }],
        },
        // Single-line field followed by multi-line method without blank line - NOT OK
        {
          code: `
class Foo {
  a = 1
  method() {
    return this.a
  }
}
`,
          output: `
class Foo {
  a = 1
  \nmethod() {
    return this.a
  }
}
`,
          errors: [{ messageId: 'missing' }],
        },
      ],
    })
  })
})
