/**
 * @fileoverview Tests for infra-public-method-try-catch rule
 */

const { RuleTester } = require('eslint')
const rule = require('./infra-public-method-try-catch.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

ruleTester.run('infra-public-method-try-catch', rule, {
  valid: [
    // Public async method with try-catch - OK
    {
      code: `
        class FirebaseAuthGateway {
          async login() {
            try {
              await this.auth.signIn()
            } catch (error) {
              this.logger.error(error)
              throw error
            }
          }
        }
      `,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
    },
    // Private method without try-catch - OK
    {
      code: `
        class FirebaseAuthGateway {
          private async _fetchUser() {
            await this.auth.getUser()
          }
        }
      `,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
    },
    // Sync method without try-catch - OK
    {
      code: `
        class FirebaseAuthGateway {
          getConfig() {
            return this.config
          }
        }
      `,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
    },
    // Constructor - OK
    {
      code: `
        class FirebaseAuthGateway {
          constructor() {
            this.auth = getAuth()
          }
        }
      `,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
    },
    // Getter - OK
    {
      code: `
        class FirebaseAuthGateway {
          get user() {
            return this._user
          }
        }
      `,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
    },
    // In-memory implementation (test double) - OK
    {
      code: `
        class InMemoryAuthGateway {
          async login() {
            return this.user
          }
        }
      `,
      filename: '/project/infra/auth-gateway/in-memory.auth.gateway.ts',
    },
    // Fake implementation - OK
    {
      code: `
        class FakeAuthGateway {
          async login() {
            return this.user
          }
        }
      `,
      filename: '/project/infra/auth-gateway/fake.auth.gateway.ts',
    },
    // Test file - should not apply
    {
      code: `
        class TestGateway {
          async fetch() {
            await this.api.get()
          }
        }
      `,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.test.ts',
    },
    // Not in infra - should not apply
    {
      code: `
        class SomeService {
          async fetch() {
            await this.api.get()
          }
        }
      `,
      filename: '/project/core/auth/auth.service.ts',
    },
  ],

  invalid: [
    // Public async method without try-catch - NOT OK
    {
      code: `
        class FirebaseAuthGateway {
          async login() {
            await this.auth.signIn()
          }
        }
      `,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
      errors: [
        {
          messageId: 'publicMethodNeedsTryCatch',
          data: { methodName: 'login' },
        },
      ],
    },
    // Multiple public async methods without try-catch - NOT OK
    {
      code: `
        class FirebaseAuthGateway {
          async login() {
            await this.auth.signIn()
          }
          async logout() {
            await this.auth.signOut()
          }
        }
      `,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
      errors: [
        { messageId: 'publicMethodNeedsTryCatch', data: { methodName: 'login' } },
        { messageId: 'publicMethodNeedsTryCatch', data: { methodName: 'logout' } },
      ],
    },
    // Repository method without try-catch - NOT OK
    {
      code: `
        class PrismaBlocklistRepository {
          async findAll() {
            return await this.prisma.blocklist.findMany()
          }
        }
      `,
      filename: '/project/infra/blocklist-repository/prisma.blocklist.repository.ts',
      errors: [
        {
          messageId: 'publicMethodNeedsTryCatch',
          data: { methodName: 'findAll' },
        },
      ],
    },
  ],
})
