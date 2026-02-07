/**
 * @fileoverview Tests for file-naming-convention rule
 */

const { RuleTester } = require('eslint')
const rule = require('./file-naming-convention.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('file-naming-convention', rule, {
  valid: [
    // Core usecase files
    {
      code: `export const login = () => {}`,
      filename: '/project/core/auth/usecases/login.usecase.ts',
    },
    {
      code: `describe('test', () => {})`,
      filename: '/project/core/auth/usecases/login.usecase.spec.ts',
    },
    // Core listener files
    {
      code: `export const onUserLoggedInListener = () => {}`,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.ts',
    },
    {
      code: `describe('test', () => {})`,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.test.ts',
    },
    // Core selector files
    {
      code: `export const selectUser = () => {}`,
      filename: '/project/core/auth/selectors/selectUser.ts',
    },
    {
      code: `export const selectHomeViewModel = () => {}`,
      filename: '/project/core/auth/selectors/home.view-model.ts',
    },
    // Core slice files
    {
      code: `export const authSlice = createSlice({})`,
      filename: '/project/core/auth/auth.slice.ts',
    },
    // Core builder files
    {
      code: `export const buildSession = () => ({})`,
      filename: '/project/core/_tests_/data-builders/session.builder.ts',
    },
    // Core fixture files
    {
      code: `export const authFixture = {}`,
      filename: '/project/core/auth/auth.fixture.ts',
    },
    // Infra files
    {
      code: `export class FirebaseAuthGateway {}`,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
    },
    {
      code: `describe('test', () => {})`,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.test.ts',
    },
    // UI component files
    {
      code: `export function Button() { return <button /> }`,
      filename: '/project/ui/components/Button.tsx',
    },
    // UI hook files
    {
      code: `export const useAuth = () => {}`,
      filename: '/project/ui/hooks/useAuth.ts',
    },
    // UI view-model files
    {
      code: `export const selectHomeViewModel = () => ({})`,
      filename: '/project/ui/screens/Home/home.view-model.ts',
    },
    // UI schema files
    {
      code: `export const loginSchema = z.object({})`,
      filename: '/project/ui/schemas/login.schema.ts',
    },
    // UI helper files
    {
      code: `export const formatDate = () => {}`,
      filename: '/project/ui/utils/date.helper.ts',
    },
    // App route files
    {
      code: `export default function Page() { return <div /> }`,
      filename: '/project/app/(tabs)/home.tsx',
    },
    {
      code: `export default function Layout() { return <div /> }`,
      filename: '/project/app/_layout.tsx',
    },
    {
      code: `export default function Index() { return <div /> }`,
      filename: '/project/app/index.tsx',
    },
    // Dynamic routes
    {
      code: `export default function Page() { return <div /> }`,
      filename: '/project/app/[id].tsx',
    },
    // node_modules - should skip
    {
      code: `export const anything = {}`,
      filename: '/project/node_modules/package/BadName.ts',
    },
  ],

  invalid: [
    // Bad usecase naming
    {
      code: `export const login = () => {}`,
      filename: '/project/core/auth/usecases/Login.usecase.ts',
      errors: [{ messageId: 'coreUsecaseNaming' }],
    },
    // Bad usecase test naming
    {
      code: `describe('test', () => {})`,
      filename: '/project/core/auth/usecases/login.test.ts',
      errors: [{ messageId: 'coreUsecaseTestNaming' }],
    },
    // Bad listener naming
    {
      code: `export const listener = () => {}`,
      filename: '/project/core/auth/listeners/userLoggedIn.listener.ts',
      errors: [{ messageId: 'coreListenerNaming' }],
    },
    // Bad listener test naming
    {
      code: `describe('test', () => {})`,
      filename: '/project/core/auth/listeners/auth.test.ts',
      errors: [{ messageId: 'coreListenerTestNaming' }],
    },
    // Bad selector naming
    {
      code: `export const user = () => {}`,
      filename: '/project/core/auth/selectors/user.ts',
      errors: [{ messageId: 'coreSelectorNaming' }],
    },
    // Bad slice naming
    {
      code: `export const slice = createSlice({})`,
      filename: '/project/core/auth/Auth.slice.ts',
      errors: [{ messageId: 'coreSliceNaming' }],
    },
    // Bad builder naming
    {
      code: `export const build = () => ({})`,
      filename: '/project/core/_tests_/data-builders/Session.builder.ts',
      errors: [{ messageId: 'coreBuilderNaming' }],
    },
    // Bad fixture naming
    {
      code: `export const fixture = {}`,
      filename: '/project/core/auth/Auth.fixture.ts',
      errors: [{ messageId: 'coreFixtureNaming' }],
    },
    // Type files with .types.ts (should be .type.ts)
    {
      code: `export type User = {}`,
      filename: '/project/core/auth/auth.types.ts',
      errors: [{ messageId: 'coreTypeFileNaming' }],
    },
    // Bad infra naming
    {
      code: `export class Gateway {}`,
      filename: '/project/infra/auth-gateway/FirebaseAuthGateway.ts',
      errors: [{ messageId: 'infraImplementationNaming' }],
    },
    // Infra with .spec.ts (should be .test.ts)
    {
      code: `describe('test', () => {})`,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.spec.ts',
      errors: [{ messageId: 'infraTestNaming' }],
    },
    // Bad UI component naming
    {
      code: `export function button() { return <button /> }`,
      filename: '/project/ui/components/button.tsx',
      errors: [{ messageId: 'uiComponentNaming' }],
    },
    // Bad UI hook naming
    {
      code: `export const auth = () => {}`,
      filename: '/project/ui/hooks/auth.ts',
      errors: [{ messageId: 'uiHookNaming' }],
    },
    // Bad app route naming
    {
      code: `export default function Page() { return <div /> }`,
      filename: '/project/app/(tabs)/HomePage.tsx',
      errors: [{ messageId: 'appRouteNaming' }],
    },
  ],
})
