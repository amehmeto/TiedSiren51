export interface AppStorage {
  initialize(): Promise<void>
  disconnect(): Promise<void>
  isInitialized(): boolean
  refresh(): Promise<void>
}
