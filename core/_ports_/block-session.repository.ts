import { BlockSession } from '../block-session/block-session'
import { CreatePayload } from './create.payload'
import { UpdatePayload } from './update.payload'

export interface BlockSessionRepository {
  create(sessionPayload: CreatePayload<BlockSession>): Promise<BlockSession>
  findAll(): Promise<BlockSession[]>
  findById(sessionId: string): Promise<BlockSession>
  update(session: UpdatePayload<BlockSession>): Promise<void>
  delete(sessionId: string): Promise<void>
  deleteAll(): Promise<void>
}
