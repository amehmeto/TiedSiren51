import { Blocklist } from '../blocklist/blocklist'
import { CreatePayload } from './create.payload'
import { UpdatePayload } from './update.payload'

export interface BlocklistRepository {
  findAll(userId: string): Promise<Blocklist[]>
  create(userId: string, payload: CreatePayload<Blocklist>): Promise<Blocklist>
  update(payload: UpdatePayload<Blocklist>): Promise<void>
  findById(blocklistId: string): Promise<Blocklist>
  delete(blocklistId: string): Promise<void>
  deleteAll(userId: string): Promise<void>
}
