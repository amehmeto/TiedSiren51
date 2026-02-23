import { ISODateString } from '@/core/_ports_/date-provider'
import { TimerRepository } from '@/core/_ports_/timer.repository'
import { PowersyncRepository } from '@/infra/__abstract__/powersync.repository'
import { TimerRecord } from '@/infra/database-service/powersync.schema'

export class PowersyncTimerRepository
  extends PowersyncRepository
  implements TimerRepository
{
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
