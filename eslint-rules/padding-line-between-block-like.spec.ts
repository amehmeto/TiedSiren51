/**
 * @fileoverview Tests for padding-line-between-block-like rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./padding-line-between-block-like.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('padding-line-between-block-like', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('padding-line-between-block-like', rule, {
      valid: [
        // Non-block statements without blank line - OK
        {
          code: `
const a = 1
const b = 2
`,
        },
        // Block-like statements with blank line between - OK
        {
          code: `
if (a) {
  doA()
}

if (b) {
  doB()
}
`,
        },
        // Function declarations with blank line between - OK
        {
          code: `
function foo() {
  return 1
}

function bar() {
  return 2
}
`,
        },
        // Block-like followed by non-block - OK (only checks block-to-block)
        {
          code: `
if (a) {
  doA()
}
const b = 2
`,
        },
        // Single block statement - OK
        {
          code: `
if (a) {
  doA()
}
`,
        },
      ],

      invalid: [
        // Two if blocks without blank line - NOT OK
        {
          code: `
if (a) {
  doA()
}
if (b) {
  doB()
}
`,
          output: `
if (a) {
  doA()
}
\nif (b) {
  doB()
}
`,
          errors: [{ messageId: 'missing' }],
        },
        // Two function declarations without blank line - NOT OK
        {
          code: `
function foo() {
  return 1
}
function bar() {
  return 2
}
`,
          output: `
function foo() {
  return 1
}
\nfunction bar() {
  return 2
}
`,
          errors: [{ messageId: 'missing' }],
        },
        // For loop followed by while loop without blank line - NOT OK
        {
          code: `
for (let i = 0; i < 10; i++) {
  doA()
}
while (x) {
  doB()
}
`,
          output: `
for (let i = 0; i < 10; i++) {
  doA()
}
\nwhile (x) {
  doB()
}
`,
          errors: [{ messageId: 'missing' }],
        },
      ],
    })
  })
})
