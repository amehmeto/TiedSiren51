import { AbstractPowerSyncDatabase } from '@powersync/common'
import { Logger } from '@/core/_ports_/logger'

export abstract class PowersyncRepository {
  protected readonly db: AbstractPowerSyncDatabase

  protected readonly logger: Logger

  constructor(db: AbstractPowerSyncDatabase, logger: Logger) {
    this.db = db
    this.logger = logger
  }
}
