export interface SirenTier {
  block(packageName: string): Promise<void>
  initializeNativeBlocking(): Promise<void>
}
