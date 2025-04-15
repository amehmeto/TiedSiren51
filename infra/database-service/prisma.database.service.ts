import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

export class PrismaDatabaseService
  extends PrismaRepository
  implements DatabaseService
{
  constructor() {
    super()
  }

  getDbPath(): string {
    return super.getDbPath()
  }

  async initialize(): Promise<void> {
    return super.initialize()
  }
}
