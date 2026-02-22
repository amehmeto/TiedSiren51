export interface DatabaseService {
  getDbPath(): string
  initialize(): Promise<void>
  getDatabase(): unknown
  claimOrphanedRows(userId: string): Promise<void>
}
