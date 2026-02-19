import { DatabaseService } from '@/core/_ports_/database.service'

export class StubDatabaseService implements DatabaseService {
  getDbPath(): string {
    return ''
  }

  initialize(): Promise<void> {
    return Promise.resolve(undefined)
  }

  claimOrphanedData(_userId: string): Promise<void> {
    return Promise.resolve(undefined)
  }
}
