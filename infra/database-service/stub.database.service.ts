import { DatabaseService } from '@/core/_ports_/database.service'

export class StubDatabaseService implements DatabaseService {
  getDbPath(): string {
    return ''
  }

  getDatabase(): unknown {
    return null
  }

  initialize(): Promise<void> {
    return Promise.resolve(undefined)
  }

  claimOrphanedRows(_userId: string): Promise<void> {
    return Promise.resolve()
  }
}
