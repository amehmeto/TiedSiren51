export interface DatabaseService {
  getDbPath(): string
  initialize(): Promise<void>
}
