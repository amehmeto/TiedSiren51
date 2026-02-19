export interface DatabaseService {
  getDbPath(): string
  initialize(): Promise<void>
  claimOrphanedData(userId: string): Promise<void>
}
