# Customization Guide

How to swap out components for alternatives.

## State Management

### Redux → Zustand

1. Remove `@reduxjs/toolkit`, `react-redux`
2. Install `zustand`
3. Convert slices to stores:
   ```ts
   // Before (Redux)
   const authSlice = createSlice({ ... })

   // After (Zustand)
   const useAuthStore = create((set) => ({ ... }))
   ```
4. Replace `useSelector` with store hooks
5. Replace thunks with store actions
6. Update `createTestStore` to create Zustand stores

### Redux → Jotai

1. Remove `@reduxjs/toolkit`, `react-redux`
2. Install `jotai`
3. Convert slices to atoms
4. Use `useAtom` instead of `useSelector`/`useDispatch`

---

## Navigation

### React Navigation → Expo Router

1. Remove `@react-navigation/*` packages
2. Move screens to `app/` directory (file-based routing)
3. Replace `navigation.navigate()` with `router.push()`
4. Update deep linking config

---

## Form Validation

### Zod → Yup

1. Replace `zod` with `yup`
2. Convert schemas:
   ```ts
   // Before (Zod)
   z.object({ email: z.string().email() })

   // After (Yup)
   yup.object({ email: yup.string().email() })
   ```

### Zod → Valibot

1. Replace `zod` with `valibot` (smaller bundle)
2. Convert schemas (similar API)

---

## UI Framework

### Expo → Bare React Native

1. Run `npx expo prebuild --clean`
2. Remove Expo-specific packages or replace with RN equivalents
3. Update native project configurations
4. Replace `expo-*` packages with community alternatives

### React Native → Web (React)

1. Core logic (`core/`) works as-is
2. Replace `ui/` with React web components
3. Replace React Navigation with React Router
4. Replace AsyncStorage with localStorage

---

## Testing

### Vitest → Jest

1. Replace `vitest` with `jest`, `@types/jest`
2. Rename `vitest.config.js` to `jest.config.js`
3. Update config format
4. Replace `vi.fn()` with `jest.fn()`
5. Replace `vi.mock()` with `jest.mock()`

---

## Logging

### Sentry → DataDog

1. Replace `@sentry/react-native` with `@datadog/mobile-react-native`
2. Update `infra/logger/sentry.logger.ts` → `datadog.logger.ts`
3. Implement same `Logger` interface

### Sentry → Console Only

1. Remove Sentry package
2. Use only `infra/logger/in-memory.logger.ts` in production
3. Or create simple console logger implementing `Logger` interface
