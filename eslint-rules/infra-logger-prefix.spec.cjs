/**
 * @fileoverview Tests for infra-logger-prefix rule
 */

const { RuleTester } = require('eslint')
const rule = require('./infra-logger-prefix.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('infra-logger-prefix', rule, {
  valid: [
    // Correct prefix with template literal - OK
    {
      code: `
        class FirebaseAuthGateway {
          login() {
            this.logger.info(\`[FirebaseAuthGateway] Login successful\`)
          }
        }
      `,
    },
    // Correct prefix with string literal - OK
    {
      code: `
        class FirebaseAuthGateway {
          login() {
            this.logger.error('[FirebaseAuthGateway] Login failed')
          }
        }
      `,
    },
    // All log methods with prefix - OK
    {
      code: `
        class MyService {
          doSomething() {
            this.logger.info('[MyService] Info')
            this.logger.warn('[MyService] Warning')
            this.logger.error('[MyService] Error')
            this.logger.debug('[MyService] Debug')
          }
        }
      `,
    },
    // Not this.logger - should not apply
    {
      code: `
        class MyService {
          doSomething() {
            console.log('No prefix needed')
          }
        }
      `,
    },
    // Not inside a class - should not apply
    {
      code: `
        function doSomething() {
          this.logger.info('No class context')
        }
      `,
    },
    // Test file - should not apply
    {
      code: `
        class TestClass {
          test() {
            this.logger.info('No prefix needed in tests')
          }
        }
      `,
      filename: '/project/infra/auth/auth.test.ts',
    },
  ],

  invalid: [
    // Missing prefix in template literal - NOT OK
    {
      code: `
        class FirebaseAuthGateway {
          login() {
            this.logger.info(\`Login successful\`)
          }
        }
      `,
      output: `
        class FirebaseAuthGateway {
          login() {
            this.logger.info(\`[FirebaseAuthGateway] Login successful\`)
          }
        }
      `,
      errors: [
        {
          messageId: 'missingPrefix',
          data: { method: 'info', className: 'FirebaseAuthGateway' },
        },
      ],
    },
    // Missing prefix in string literal - NOT OK
    {
      code: `
        class FirebaseAuthGateway {
          login() {
            this.logger.error('Login failed')
          }
        }
      `,
      output: `
        class FirebaseAuthGateway {
          login() {
            this.logger.error('[FirebaseAuthGateway] Login failed')
          }
        }
      `,
      errors: [
        {
          messageId: 'missingPrefix',
          data: { method: 'error', className: 'FirebaseAuthGateway' },
        },
      ],
    },
    // Wrong prefix - NOT OK
    {
      code: `
        class FirebaseAuthGateway {
          login() {
            this.logger.info('[WrongClass] Login')
          }
        }
      `,
      output: `
        class FirebaseAuthGateway {
          login() {
            this.logger.info('[FirebaseAuthGateway] [WrongClass] Login')
          }
        }
      `,
      errors: [
        {
          messageId: 'missingPrefix',
          data: { method: 'info', className: 'FirebaseAuthGateway' },
        },
      ],
    },
    // Multiple missing prefixes - NOT OK
    {
      code: `
        class MyService {
          doSomething() {
            this.logger.info('Info message')
            this.logger.warn('Warning message')
          }
        }
      `,
      output: `
        class MyService {
          doSomething() {
            this.logger.info('[MyService] Info message')
            this.logger.warn('[MyService] Warning message')
          }
        }
      `,
      errors: [
        { messageId: 'missingPrefix', data: { method: 'info', className: 'MyService' } },
        { messageId: 'missingPrefix', data: { method: 'warn', className: 'MyService' } },
      ],
    },
  ],
})
