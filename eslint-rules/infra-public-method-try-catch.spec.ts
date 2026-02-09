/**
 * @fileoverview Tests for infra-public-method-try-catch rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./infra-public-method-try-catch.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

describe('infra-public-method-try-catch', () => {
  it('should pass all rule tests', () => {
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
        // Try-catch inside if block - OK
        {
          code: `
        class FirebaseAuthGateway {
          async login() {
            if (condition) {
              try {
                await this.auth.signIn()
              } catch (error) {
                throw error
              }
            }
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Try-catch as direct consequent of if - OK
        {
          code: `
        class FirebaseAuthGateway {
          async login() {
            if (condition)
              try {
                await this.auth.signIn()
              } catch (error) {
                throw error
              }
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Try-catch inside else block - OK
        {
          code: `
        class FirebaseAuthGateway {
          async login() {
            if (condition) {
              return
            } else {
              try {
                await this.auth.signIn()
              } catch (error) {
                throw error
              }
            }
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Try-catch as direct alternate of if - OK
        {
          code: `
        class FirebaseAuthGateway {
          async login() {
            if (condition) {
              return
            } else
              try {
                await this.auth.signIn()
              } catch (error) {
                throw error
              }
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Try-catch in else-if chain - OK
        {
          code: `
        class FirebaseAuthGateway {
          async login() {
            if (a) {
              return 1
            } else if (b) {
              try {
                await this.auth.signIn()
              } catch (error) {
                throw error
              }
            }
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // node_modules - should skip
        {
          code: `
        class ExternalGateway {
          async fetch() {
            await this.api.get()
          }
        }
      `,
          filename: '/project/node_modules/pkg/gateway.ts',
        },
        // Setter - OK
        {
          code: `
        class FirebaseAuthGateway {
          set user(value) {
            this._user = value
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Underscore prefix method (private by convention) - OK
        {
          code: `
        class FirebaseAuthGateway {
          async _fetchData() {
            await this.api.get()
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // ESNext private method (# syntax) - OK
        {
          code: `
        class FirebaseAuthGateway {
          async #fetchData() {
            await this.api.get()
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // ClassExpression with try-catch - OK
        {
          code: `
        const Gateway = class {
          async fetch() {
            try {
              await this.api.get()
            } catch (error) {
              throw error
            }
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Method not inside a class - OK
        {
          code: `
        async function fetch() {
          await api.get()
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // fake- prefix in filename - OK
        {
          code: `
        class FakeAuthGateway {
          async login() {
            return this.user
          }
        }
      `,
          filename: '/project/infra/auth-gateway/fake-auth.gateway.ts',
        },
        // fake-data in filename - OK
        {
          code: `
        class FakeDataService {
          async getData() {
            return this.data
          }
        }
      `,
          filename: '/project/infra/auth-gateway/fake-data.gateway.ts',
        },
        // stub in filename - OK
        {
          code: `
        class StubAuthGateway {
          async login() {
            return this.user
          }
        }
      `,
          filename: '/project/infra/auth-gateway/stub.auth.gateway.ts',
        },
        // Method without body (abstract) - OK
        {
          code: `
        abstract class BaseGateway {
          abstract async fetch(): Promise<void>
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
      ],

      invalid: [
        // Public async method without try-catch - NOT OK
        {
          code: `class FirebaseAuthGateway {
  async login() {
    await this.auth.signIn()
  }
}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
          errors: [
            {
              messageId: 'publicMethodNeedsTryCatch',
              data: { methodName: 'login' },
            },
          ],
          output:
            'class FirebaseAuthGateway {\n  async login() {\n    try {\n      await this.auth.signIn()\n  \n    } catch (error) {\n      this.logger.error(`[FirebaseAuthGateway] Failed to login: ${error}`)\n      throw error\n    }\n  }\n}',
        },
        // Multiple public async methods without try-catch - NOT OK
        {
          code: `class FirebaseAuthGateway {
  async login() {
    await this.auth.signIn()
  }
  async logout() {
    await this.auth.signOut()
  }
}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
          errors: [
            {
              messageId: 'publicMethodNeedsTryCatch',
              data: { methodName: 'login' },
            },
            {
              messageId: 'publicMethodNeedsTryCatch',
              data: { methodName: 'logout' },
            },
          ],
          output:
            'class FirebaseAuthGateway {\n  async login() {\n    try {\n      await this.auth.signIn()\n  \n    } catch (error) {\n      this.logger.error(`[FirebaseAuthGateway] Failed to login: ${error}`)\n      throw error\n    }\n  }\n  async logout() {\n    try {\n      await this.auth.signOut()\n  \n    } catch (error) {\n      this.logger.error(`[FirebaseAuthGateway] Failed to logout: ${error}`)\n      throw error\n    }\n  }\n}',
        },
        // Repository method without try-catch - NOT OK
        {
          code: `class PrismaBlocklistRepository {
  async findAll() {
    return await this.prisma.blocklist.findMany()
  }
}`,
          filename:
            '/project/infra/blocklist-repository/prisma.blocklist.repository.ts',
          errors: [
            {
              messageId: 'publicMethodNeedsTryCatch',
              data: { methodName: 'findAll' },
            },
          ],
          output:
            'class PrismaBlocklistRepository {\n  async findAll() {\n    try {\n      return await this.prisma.blocklist.findMany()\n  \n    } catch (error) {\n      this.logger.error(`[PrismaBlocklistRepository] Failed to findAll: ${error}`)\n      throw error\n    }\n  }\n}',
        },
        // ClassExpression without try-catch - NOT OK
        {
          code: `const Gateway = class FirebaseGateway {
  async fetch() {
    await this.api.get()
  }
}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
          errors: [
            {
              messageId: 'publicMethodNeedsTryCatch',
              data: { methodName: 'fetch' },
            },
          ],
          output:
            'const Gateway = class FirebaseGateway {\n  async fetch() {\n    try {\n      await this.api.get()\n  \n    } catch (error) {\n      this.logger.error(`[FirebaseGateway] Failed to fetch: ${error}`)\n      throw error\n    }\n  }\n}',
        },
        // Anonymous ClassExpression without try-catch - NOT OK
        {
          code: `const Gateway = class {
  async fetch() {
    await this.api.get()
  }
}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
          errors: [
            {
              messageId: 'publicMethodNeedsTryCatch',
              data: { methodName: 'fetch' },
            },
          ],
          output:
            'const Gateway = class {\n  async fetch() {\n    try {\n      await this.api.get()\n  \n    } catch (error) {\n      this.logger.error(`[UnknownClass] Failed to fetch: ${error}`)\n      throw error\n    }\n  }\n}',
        },
        // Computed property method with literal key - NOT OK (key is Literal, not Identifier)
        {
          code: `class Gateway {
  async ['fetch']() {
    await this.api.get()
  }
}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
          errors: [
            {
              messageId: 'publicMethodNeedsTryCatch',
              data: { methodName: '<anonymous>' },
            },
          ],
          output:
            "class Gateway {\n  async ['fetch']() {\n    try {\n      await this.api.get()\n  \n    } catch (error) {\n      this.logger.error(`[Gateway] Failed to <anonymous>: ${error}`)\n      throw error\n    }\n  }\n}",
        },
      ],
    })
  })
})
