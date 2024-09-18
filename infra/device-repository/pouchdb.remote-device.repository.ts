import { Device } from '@/core/device/device'
import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'
import PouchDB from 'pouchdb'

export class PouchdbRemoteDeviceRepository implements RemoteDeviceRepository {
  private db: PouchDB.Database<Device> = new PouchDB('remote-devices')

  async findAll(): Promise<Device[]> {
    const response = await this.db.allDocs({ include_docs: true })
    return response.rows
      .map((row) => {
        if (row.doc) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, _rev, ...device } = row.doc
          return device
        }
        return undefined
      })
      .filter((device): device is Device => Boolean(device))
  }
}
