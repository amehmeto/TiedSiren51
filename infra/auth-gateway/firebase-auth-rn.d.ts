import { Persistence } from 'firebase/auth'

/**
 * Module augmentation for firebase/auth React Native persistence.
 *
 * Firebase v11 exports getReactNativePersistence in its RN bundle (resolved
 * by Metro at runtime), but the TypeScript type definitions shipped with the
 * package only cover browser targets and omit this function.
 */

type ReactNativeAsyncStorage = {
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<string | null>
  removeItem(key: string): Promise<void>
}

declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence
}
