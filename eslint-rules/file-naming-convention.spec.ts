/**
 * @fileoverview Tests for file-naming-convention rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./file-naming-convention.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('file-naming-convention', () => {
  it('should pass all rule tests', () => {
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
          filename:
            '/project/core/auth/listeners/on-user-logged-in.listener.ts',
        },
        {
          code: `describe('test', () => {})`,
          filename:
            '/project/core/auth/listeners/on-user-logged-in.listener.test.ts',
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
        // Core utils files
        {
          code: `export const format = () => {}`,
          filename: '/project/core/__utils__/format.utils.ts',
        },
        {
          code: `describe('test', () => {})`,
          filename: '/project/core/__utils__/format.utils.test.ts',
        },
        // Core port files
        {
          code: `export interface AuthGateway {}`,
          filename: '/project/core/_ports_/auth.gateway.ts',
        },
        // Selector test files
        {
          code: `describe('test', () => {})`,
          filename: '/project/core/auth/selectors/selectUser.test.ts',
        },
        // View model type files
        {
          code: `export type ViewModel = {}`,
          filename: '/project/core/auth/selectors/auth-view-model.type.ts',
        },
        // isActive selector exception
        {
          code: `export const isActive = () => {}`,
          filename: '/project/core/auth/selectors/isActive.ts',
        },
        // Fixture in listeners folder
        {
          code: `export const fixture = {}`,
          filename: '/project/core/auth/listeners/auth.fixture.ts',
        },
        // Fixture in usecases folder
        {
          code: `export const fixture = {}`,
          filename: '/project/core/auth/usecases/auth.fixture.ts',
        },
        // UI fixture files
        {
          code: `export const fixture = {}`,
          filename: '/project/ui/screens/Home/home.fixture.ts',
        },
        // UI view-model test
        {
          code: `describe('test', () => {})`,
          filename: '/project/ui/screens/Home/home.view-model.test.ts',
        },
        // UI schema test
        {
          code: `describe('test', () => {})`,
          filename: '/project/ui/schemas/login.schema.test.ts',
        },
        // UI helper test
        {
          code: `describe('test', () => {})`,
          filename: '/project/ui/utils/date.helper.test.ts',
        },
        // Infra __abstract__ folder - should skip folder check
        {
          code: `export abstract class Base {}`,
          filename: '/project/infra/__abstract__/base.ts',
        },
        // Infra config file
        {
          code: `export const config = {}`,
          filename: '/project/infra/auth-gateway/firebaseConfig.ts',
        },
        // Core special folders
        {
          code: `export const something = {}`,
          filename: '/project/core/_redux_/store.ts',
        },
        // App special files
        {
          code: `export default function NotFound() { return <div /> }`,
          filename: '/project/app/+not-found.tsx',
        },
        // App +html.tsx
        {
          code: `export default function Html() { return <html /> }`,
          filename: '/project/app/+html.tsx',
        },
        // UI .ts utility file with PascalCase (type files)
        {
          code: `export type SessionType = string`,
          filename: '/project/ui/screens/Home/SessionType.ts',
        },
        // UI .ts utility file with camelCase
        {
          code: `export const formatDate = () => {}`,
          filename: '/project/ui/screens/Home/formatDate.ts',
        },
        // UI utils folder with camelCase
        {
          code: `export const handleError = () => {}`,
          filename: '/project/ui/utils/handleError.ts',
        },
        // UI utils folder with kebab-case
        {
          code: `export const helper = () => {}`,
          filename: '/project/ui/utils/error-handler.ts',
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
          errors: [
            { messageId: 'coreTypeFileNaming' },
            { messageId: 'coreEntityNaming' },
          ],
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
        // Bad infra folder naming
        {
          code: `export class Repository {}`,
          filename: '/project/infra/AuthGateway/firebase.auth.gateway.ts',
          errors: [{ messageId: 'infraFolderNaming' }],
        },
        // Bad core folder naming (non-kebab-case)
        {
          code: `export const something = {}`,
          filename: '/project/core/BlockSession/block-session.ts',
          errors: [{ messageId: 'coreSpecialFolderNaming' }],
        },
        // Bad UI screen folder naming
        {
          code: `export function Screen() { return <div /> }`,
          filename: '/project/ui/screens/home/HomeScreen.tsx',
          errors: [{ messageId: 'uiScreenFolderNaming' }],
        },
        // Bad core utils naming
        {
          code: `export const helper = () => {}`,
          filename: '/project/core/__utils__/BadName.utils.ts',
          errors: [{ messageId: 'coreUtilsNaming' }],
        },
        // Bad core utils test naming
        {
          code: `describe('test', () => {})`,
          filename: '/project/core/__utils__/BadName.utils.test.ts',
          errors: [{ messageId: 'coreUtilsNaming' }],
        },
        // Bad UI fixture naming
        {
          code: `export const fixture = {}`,
          filename: '/project/ui/screens/Home/BadName.fixture.ts',
          errors: [{ messageId: 'coreFixtureNaming' }],
        },
        // Bad core selector test naming
        {
          code: `describe('test', () => {})`,
          filename: '/project/core/auth/selectors/BadName.test.ts',
          errors: [{ messageId: 'coreSelectorTestNaming' }],
        },
        // Bad port naming
        {
          code: `export interface Gateway {}`,
          filename: '/project/core/_ports_/AuthGateway.ts',
          errors: [{ messageId: 'corePortNaming' }],
        },
        // Bad infra test pattern
        {
          code: `describe('test', () => {})`,
          filename: '/project/infra/auth-gateway/Firebase.test.ts',
          errors: [{ messageId: 'infraTestPattern' }],
        },
        // Bad UI view-model naming
        {
          code: `export const vm = () => ({})`,
          filename: '/project/ui/screens/Home/Home.view-model.ts',
          errors: [{ messageId: 'uiViewModelNaming' }],
        },
        // Bad UI schema naming
        {
          code: `export const schema = {}`,
          filename: '/project/ui/schemas/Login.schema.ts',
          errors: [{ messageId: 'uiSchemaNaming' }],
        },
        // Bad UI helper naming
        {
          code: `export const helper = () => {}`,
          filename: '/project/ui/utils/Date.helper.ts',
          errors: [{ messageId: 'uiHelperNaming' }],
        },
        // Bad UI utility naming
        {
          code: `export const helper = () => {}`,
          filename: '/project/ui/utils/My_Helper.ts',
          errors: [{ messageId: 'uiUtilityNaming' }],
        },
        // Bad UI helper test naming
        {
          code: `describe('test', () => {})`,
          filename: '/project/ui/utils/BadName.helper.test.ts',
          errors: [{ messageId: 'uiHelperNaming' }],
        },
        // Bad UI .ts file naming (not a type, view-model, schema, or test)
        {
          code: `export const something = {}`,
          filename: '/project/ui/screens/Home/My_Bad_File.ts',
          errors: [{ messageId: 'uiUtilityNaming' }],
        },
        // Bad UI view-model test naming
        {
          code: `describe('test', () => {})`,
          filename: '/project/ui/screens/Home/BadName.view-model.test.ts',
          errors: [{ messageId: 'uiViewModelNaming' }],
        },
        // Bad UI schema test naming
        {
          code: `describe('test', () => {})`,
          filename: '/project/ui/schemas/BadName.schema.test.ts',
          errors: [{ messageId: 'uiSchemaNaming' }],
        },
      ],
    })
  })
})
