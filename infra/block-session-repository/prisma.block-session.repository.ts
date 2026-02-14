import uuid from 'react-native-uuid'
import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { assertHHmmString } from '@/core/_ports_/date-provider'
import { Logger } from '@/core/_ports_/logger'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { BlockSession } from '@/core/block-session/block-session'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

type DbBlockSession = {
  id: string
  name: string
  startedAt: string
  endedAt: string
  startNotificationId: string
  endNotificationId: string
  blockingConditions: string
  blocklists: {
    id: string
    name: string
    sirens: string
  }[]
  devices: {
    id: string
    type: string
    name: string
  }[]
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
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    try {
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

  async findAll(): Promise<BlockSession[]> {
    try {
      const sessions = await this.baseClient.blockSession.findMany({
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

  async findById(id: string): Promise<BlockSession> {
    try {
      const session = await this.baseClient.blockSession.findUnique({
        where: { id },
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

  async update(payload: UpdatePayload<BlockSession>): Promise<void> {
    try {
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
          blocklists: blocklistIds
            ? {
                set: blocklistIds,
              }
            : undefined,
          devices: deviceIds
            ? {
                set: deviceIds,
              }
            : undefined,
        },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaBlockSessionRepository] Failed to update block session ${payload.id}: ${error}`,
      )
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.baseClient.blockSession.update({
        where: { id },
        data: {
          blocklists: { set: [] },
          devices: { set: [] },
        },
      })

      await this.baseClient.blockSession.delete({
        where: { id },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaBlockSessionRepository] Failed to delete block session ${id}: ${error}`,
      )
      throw error
    }
  }

  async deleteAll(): Promise<void> {
    try {
      const sessions = await this.baseClient.blockSession.findMany()
      for (const session of sessions) await this.delete(session.id)
    } catch (error) {
      this.logger.error(
        `[PrismaBlockSessionRepository] Failed to delete all block sessions: ${error}`,
      )
      throw error
    }
  }
}
