import { AbstractPowerSyncDatabase } from '@powersync/common'
import { BlocklistRepository } from '@/core/_ports_/blocklist.repository'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { Logger } from '@/core/_ports_/logger'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { Blocklist } from '@/core/blocklist/blocklist'
import { BlocklistRecord } from '@/infra/database-service/powersync.schema'

export class PowersyncBlocklistRepository implements BlocklistRepository {
  private readonly logger: Logger

  private readonly db: AbstractPowerSyncDatabase

  constructor(db: AbstractPowerSyncDatabase, logger: Logger) {
    this.db = db
    this.logger = logger
  }

  async create(
    userId: string,
    blocklistPayload: CreatePayload<Blocklist>,
  ): Promise<Blocklist> {
    try {
      const { id } = await this.db.get<{ id: string }>('SELECT uuid() as id')

      await this.db.execute(
        'INSERT INTO blocklist (id, user_id, name, sirens) VALUES (?, ?, ?, ?)',
        [
          id,
          userId,
          blocklistPayload.name,
          JSON.stringify(blocklistPayload.sirens),
        ],
      )

      const created = await this.db.get<BlocklistRecord>(
        'SELECT * FROM blocklist WHERE id = ?',
        [id],
      )

      return this.mapToBlocklist(created)
    } catch (error) {
      this.logger.error(
        `[PowersyncBlocklistRepository] Failed to create blocklist: ${error}`,
      )
      throw error
    }
  }

  async findAll(userId: string): Promise<Blocklist[]> {
    try {
      const rows = await this.db.getAll<BlocklistRecord>(
        'SELECT * FROM blocklist WHERE user_id = ?',
        [userId],
      )

      return rows.map(this.mapToBlocklist)
    } catch (error) {
      this.logger.error(
        `[PowersyncBlocklistRepository] Failed to find all blocklists: ${error}`,
      )
      throw error
    }
  }

  async update(
    userId: string,
    payload: UpdatePayload<Blocklist>,
  ): Promise<void> {
    try {
      const { name, sirens, id } = payload
      await this.db.execute(
        'UPDATE blocklist SET name = ?, sirens = ? WHERE id = ? AND user_id = ?',
        [name, JSON.stringify(sirens), id, userId],
      )
    } catch (error) {
      this.logger.error(
        `[PowersyncBlocklistRepository] Failed to update blocklist ${payload.id}: ${error}`,
      )
      throw error
    }
  }

  async findById(userId: string, id: string): Promise<Blocklist> {
    try {
      const row = await this.db.getOptional<BlocklistRecord>(
        'SELECT * FROM blocklist WHERE id = ? AND user_id = ?',
        [id, userId],
      )

      if (!row) throw new Error(`Blocklist ${id} not found`)

      return this.mapToBlocklist(row)
    } catch (error) {
      this.logger.error(
        `[PowersyncBlocklistRepository] Failed to find blocklist ${id}: ${error}`,
      )
      throw error
    }
  }

  async delete(userId: string, id: string): Promise<void> {
    try {
      await this.db.execute(
        'DELETE FROM block_session_blocklist WHERE blocklist_id = ? AND blocklist_id IN (SELECT id FROM blocklist WHERE user_id = ?)',
        [id, userId],
      )
      await this.db.execute(
        'DELETE FROM blocklist WHERE id = ? AND user_id = ?',
        [id, userId],
      )
    } catch (error) {
      this.logger.error(
        `[PowersyncBlocklistRepository] Failed to delete blocklist ${id}: ${error}`,
      )
      throw error
    }
  }

  async deleteAll(userId: string): Promise<void> {
    try {
      await this.db.execute(
        `DELETE FROM block_session_blocklist WHERE blocklist_id IN
          (SELECT id FROM blocklist WHERE user_id = ?)`,
        [userId],
      )
      await this.db.execute('DELETE FROM blocklist WHERE user_id = ?', [userId])
    } catch (error) {
      this.logger.error(
        `[PowersyncBlocklistRepository] Failed to delete all blocklists: ${error}`,
      )
      throw error
    }
  }

  private mapToBlocklist(row: BlocklistRecord): Blocklist {
    const { id, name, sirens } = row

    return {
      id,
      name: name ?? '',
      sirens: JSON.parse(sirens ?? '{}'),
    }
  }
}
