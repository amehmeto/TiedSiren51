import { BlockSession } from '../block-session/block-session'
import { CreatePayload } from './create.payload'
import { UpdatePayload } from './update.payload'

export interface BlockSessionRepository {
  create(
    userId: string,
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession>
  findAll(userId: string): Promise<BlockSession[]>
  findById(sessionId: string): Promise<BlockSession>
  update(session: UpdatePayload<BlockSession>): Promise<void>
  delete(sessionId: string): Promise<void>
  deleteAll(userId: string): Promise<void>
}
