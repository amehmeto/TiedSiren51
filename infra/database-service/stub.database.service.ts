import { DatabaseService } from '@/core/ports/database.service'

export class StubDatabaseService implements DatabaseService {
  getDbPath(): string {
    return ''
  }

  initialize(): Promise<void> {
    return Promise.resolve(undefined)
  }
}
