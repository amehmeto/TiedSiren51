import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'
import { DatabaseService } from '@/core/ports/database.service'

export class PrismaDatabaseService
  extends PrismaRepository
  implements DatabaseService
{
  getDbPath(): string {
    return super.getDbPath()
  }

  async initialize(): Promise<void> {
    return super.initialize()
  }
}
