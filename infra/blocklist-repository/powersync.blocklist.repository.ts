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

  async create(blocklistPayload: CreatePayload<Blocklist>): Promise<Blocklist> {
    try {
      const { id } = await this.db.get<{ id: string }>('SELECT uuid() as id')

      await this.db.execute(
        'INSERT INTO blocklist (id, name, sirens) VALUES (?, ?, ?)',
        [id, blocklistPayload.name, JSON.stringify(blocklistPayload.sirens)],
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

  async findAll(): Promise<Blocklist[]> {
    try {
      const rows = await this.db.getAll<BlocklistRecord>(
        'SELECT * FROM blocklist',
      )

      return rows.map(this.mapToBlocklist)
    } catch (error) {
      this.logger.error(
        `[PowersyncBlocklistRepository] Failed to find all blocklists: ${error}`,
      )
      throw error
    }
  }

  async update(payload: UpdatePayload<Blocklist>): Promise<void> {
    try {
      const { name, sirens, id } = payload
      await this.db.execute(
        'UPDATE blocklist SET name = ?, sirens = ? WHERE id = ?',
        [name, JSON.stringify(sirens), id],
      )
    } catch (error) {
      this.logger.error(
        `[PowersyncBlocklistRepository] Failed to update blocklist ${payload.id}: ${error}`,
      )
      throw error
    }
  }

  async findById(id: string): Promise<Blocklist> {
    try {
      const row = await this.db.getOptional<BlocklistRecord>(
        'SELECT * FROM blocklist WHERE id = ?',
        [id],
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

  async delete(id: string): Promise<void> {
    try {
      await this.db.execute(
        'DELETE FROM block_session_blocklist WHERE blocklist_id = ?',
        [id],
      )
      await this.db.execute('DELETE FROM blocklist WHERE id = ?', [id])
    } catch (error) {
      this.logger.error(
        `[PowersyncBlocklistRepository] Failed to delete blocklist ${id}: ${error}`,
      )
      throw error
    }
  }

  async deleteAll(): Promise<void> {
    try {
      await this.db.execute('DELETE FROM block_session_blocklist')
      await this.db.execute('DELETE FROM blocklist')
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
