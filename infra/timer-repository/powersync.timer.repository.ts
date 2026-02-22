import { AbstractPowerSyncDatabase } from '@powersync/common'
import { ISODateString } from '@/core/_ports_/date-provider'
import { Logger } from '@/core/_ports_/logger'
import { TimerRepository } from '@/core/_ports_/timer.repository'
import { TimerRecord } from '@/infra/database-service/powersync.schema'

export class PowersyncTimerRepository implements TimerRepository {
  private readonly logger: Logger

  private readonly db: AbstractPowerSyncDatabase

  constructor(db: AbstractPowerSyncDatabase, logger: Logger) {
    this.db = db
    this.logger = logger
  }

  async saveTimer(userId: string, endedAt: ISODateString): Promise<void> {
    try {
      const existing = await this.db.getOptional<TimerRecord>(
        'SELECT * FROM timer WHERE id = ?',
        [userId],
      )

      await (existing
        ? this.db.execute('UPDATE timer SET ended_at = ? WHERE id = ?', [
            endedAt,
            userId,
          ])
        : this.db.execute(
            'INSERT INTO timer (id, user_id, ended_at) VALUES (?, ?, ?)',
            [userId, userId, endedAt],
          ))
    } catch (error) {
      this.logger.error(
        `[PowersyncTimerRepository] Failed to saveTimer: ${error}`,
      )
      throw error
    }
  }

  async loadTimer(userId: string): Promise<ISODateString | null> {
    try {
      const timer = await this.db.getOptional<TimerRecord>(
        'SELECT * FROM timer WHERE id = ?',
        [userId],
      )

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- PowerSync stores ISO strings as text
      return !timer ? null : ((timer.ended_at ?? null) as ISODateString | null)
    } catch (error) {
      this.logger.error(
        `[PowersyncTimerRepository] Failed to loadTimer: ${error}`,
      )
      throw error
    }
  }
}
