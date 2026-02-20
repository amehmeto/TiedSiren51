import { BlockSession } from '../block-session/block-session'
import { CreatePayload } from './create.payload'
import { UpdatePayload } from './update.payload'

export interface BlockSessionRepository {
  create(
    userId: string,
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession>
  findAll(userId: string): Promise<BlockSession[]>
  findById(userId: string, sessionId: string): Promise<BlockSession>
  update(userId: string, session: UpdatePayload<BlockSession>): Promise<void>
  delete(userId: string, sessionId: string): Promise<void>
  deleteAll(userId: string): Promise<void>
}
