import uuid from 'react-native-uuid'
import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { assertHHmmString } from '@/core/_ports_/date-provider'
import { Logger } from '@/core/_ports_/logger'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { BlockSession } from '@/core/block-session/block-session'
import {
  PrismaRepository,
  UserScopedTable,
} from '@/infra/__abstract__/prisma.repository'

type DbBlocklist = {
  id: string
  name: string
  sirens: string
}

type DbDevice = {
  id: string
  type: string
  name: string
}

type DbBlockSession = {
  id: string
  name: string
  startedAt: string
  endedAt: string
  startNotificationId: string
  endNotificationId: string
  blockingConditions: string
  blocklists: DbBlocklist[]
  devices: DbDevice[]
}

export class PrismaBlockSessionRepository
  extends PrismaRepository
  implements BlockSessionRepository
{
  protected readonly logger: Logger

  constructor(logger: Logger) {
    super()
    this.logger = logger
  }

  async create(
    userId: string,
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    try {
      await this.ensureInitialized()
      const blocklistIds = sessionPayload.blocklistIds.map((id) => ({
        id,
      }))

      const deviceIds = sessionPayload.devices.map((d) => ({
        where: { id: d.id },
        create: {
          id: d.id,
          type: d.type,
          name: d.name,
        },
      }))

      const created = await this.baseClient.blockSession.create({
        data: {
          id: String(uuid.v4()),
          userId,
          name: sessionPayload.name,
          startedAt: sessionPayload.startedAt,
          endedAt: sessionPayload.endedAt,
          startNotificationId: sessionPayload.startNotificationId,
          endNotificationId: sessionPayload.endNotificationId,
          blockingConditions: JSON.stringify(sessionPayload.blockingConditions),
          blocklists: { connect: blocklistIds },
          devices: { connectOrCreate: deviceIds },
        },
        include: {
          blocklists: true,
          devices: true,
        },
      })

      return this.mapToBlockSession(created)
    } catch (error) {
      this.logger.error(
        `[PrismaBlockSessionRepository] Failed to create block session: ${error}`,
      )
      throw error
    }
  }

  private mapToBlockSession(dbSession: DbBlockSession): BlockSession {
    assertHHmmString(dbSession.startedAt)
    assertHHmmString(dbSession.endedAt)

    return {
      id: dbSession.id,
      name: dbSession.name,
      startedAt: dbSession.startedAt,
      endedAt: dbSession.endedAt,
      startNotificationId: dbSession.startNotificationId,
      endNotificationId: dbSession.endNotificationId,
      blockingConditions: JSON.parse(dbSession.blockingConditions),
      blocklistIds: dbSession.blocklists.map((b) => b.id),
      devices: dbSession.devices,
    }
  }

  async findAll(userId: string): Promise<BlockSession[]> {
    try {
      await this.claimOrphanedRows(userId, UserScopedTable.BLOCK_SESSION)
      const sessions = await this.baseClient.blockSession.findMany({
        where: { userId },
        include: {
          blocklists: true,
          devices: true,
        },
      })

      return sessions.map(this.mapToBlockSession)
    } catch (error) {
      this.logger.error(
        `[PrismaBlockSessionRepository] Failed to find all block sessions: ${error}`,
      )
      throw error
    }
  }

  async findById(userId: string, id: string): Promise<BlockSession> {
    try {
      await this.ensureInitialized()
      const session = await this.baseClient.blockSession.findFirst({
        where: { id, userId },
        include: {
          blocklists: true,
          devices: true,
        },
      })

      if (!session) throw new Error(`BlockSession ${id} not found`)

      return this.mapToBlockSession(session)
    } catch (error) {
      this.logger.error(
        `[PrismaBlockSessionRepository] Failed to find block session ${id}: ${error}`,
      )
      throw error
    }
  }

  async update(
    userId: string,
    payload: UpdatePayload<BlockSession>,
  ): Promise<void> {
    try {
      await this.ensureInitialized()
      const session = await this.baseClient.blockSession.findFirst({
        where: { id: payload.id, userId },
      })

      if (!session)
        throw new Error(`BlockSession ${payload.id} not found for user`)

      const blocklistIds = payload.blocklistIds?.map((id) => ({ id }))
      const deviceIds = payload.devices?.map((d) => ({ id: d.id }))

      await this.baseClient.blockSession.update({
        where: { id: payload.id },
        data: {
          name: payload.name,
          startedAt: payload.startedAt,
          endedAt: payload.endedAt,
          startNotificationId: payload.startNotificationId,
          endNotificationId: payload.endNotificationId,
          blockingConditions: payload.blockingConditions
            ? JSON.stringify(payload.blockingConditions)
            : undefined,
          blocklists: blocklistIds ? { set: blocklistIds } : undefined,
          devices: deviceIds ? { set: deviceIds } : undefined,
        },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaBlockSessionRepository] Failed to update block session ${payload.id}: ${error}`,
      )
      throw error
    }
  }

  async delete(userId: string, id: string): Promise<void> {
    try {
      await this.ensureInitialized()
      const session = await this.baseClient.blockSession.findFirst({
        where: { id, userId },
      })

      if (!session) throw new Error(`BlockSession ${id} not found`)

      await this.baseClient.blockSession.update({
        where: { id },
        data: {
          blocklists: { set: [] },
          devices: { set: [] },
        },
      })

      await this.baseClient.blockSession.deleteMany({
        where: { id, userId },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaBlockSessionRepository] Failed to delete block session ${id}: ${error}`,
      )
      throw error
    }
  }

  async deleteAll(userId: string): Promise<void> {
    try {
      await this.ensureInitialized()
      const sessions = await this.baseClient.blockSession.findMany({
        where: { userId },
        select: { id: true },
      })
      const disconnectRelations = sessions.map((s) =>
        this.baseClient.blockSession.update({
          where: { id: s.id },
          data: { blocklists: { set: [] }, devices: { set: [] } },
        }),
      )
      await Promise.all(disconnectRelations)
      await this.baseClient.blockSession.deleteMany({
        where: { userId },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaBlockSessionRepository] Failed to delete all block sessions: ${error}`,
      )
      throw error
    }
  }
}
