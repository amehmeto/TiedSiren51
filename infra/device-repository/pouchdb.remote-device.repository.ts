import PouchDB from 'pouchdb'
import { Logger } from '@/core/_ports_/logger'
import { RemoteDeviceRepository } from '@/core/_ports_/remote-device.repository'
import { Device } from '@/core/device/device'

export class PouchdbRemoteDeviceRepository implements RemoteDeviceRepository {
  private db: PouchDB.Database<Device> = new PouchDB('pdb-remote-devices')

  constructor(private readonly logger: Logger) {}

  async findAll(): Promise<Device[]> {
    try {
      const response = await this.db.allDocs({ include_docs: true })
      return response.rows
        .map((row) => {
          if (row.doc) {
            const { _id, _rev, ...device } = row.doc
            return device
          }
          return undefined
        })
        .filter((device): device is Device => Boolean(device))
    } catch (error) {
      this.logger.error(
        `[PouchdbRemoteDeviceRepository] Failed to findAll: ${error}`,
      )
      throw error
    }
  }
}
