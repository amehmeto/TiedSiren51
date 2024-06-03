import { Blocklist } from '../blocklist/blocklist'
import { UpdatePayload } from './update.payload'
import { CreatePayload } from './create.payload'

export interface BlocklistRepository {
  findAll(): Promise<Blocklist[]>
  create(payload: CreatePayload<Blocklist>): Promise<Blocklist>
  update(payload: UpdatePayload<Blocklist>): Promise<void>
  findById(blocklistId: string): Promise<Blocklist>
  delete(blocklistId: string): Promise<void>
}
