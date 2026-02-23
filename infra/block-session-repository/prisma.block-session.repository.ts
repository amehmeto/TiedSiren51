/**
 * @deprecated OBSOLETE — Superseded by PowersyncBlockSessionRepository.
 * Kept for rollback safety. Removal tracked in a follow-up issue.
 * See docs/adr/infrastructure/powersync-op-sqlite.md
 */
import uuid from 'react-native-uuid'
import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { assertHHmmString } from '@/core/_ports_/date-provider'
import { Logger } from '@/core/_ports_/logger'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { BlockSession } from '@/core/block-session/block-session'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

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
    _userId: string,
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    try {
      const {
        blocklistIds,
        devices,
        name,
        startedAt,
        endedAt,
        startNotificationId,
        endNotificationId,
        blockingConditions,
      } = sessionPayload
      const blocklistIdRefs = blocklistIds.map((id) => ({ id }))
      const deviceIds = devices.map((d) => {
        const { id, type, name: deviceName } = d
        return {
          where: { id },
          create: { id, type, name: deviceName },
        }
      })

      const created = await this.baseClient.blockSession.create({
        data: {
          id: String(uuid.v4()),
          name,
          startedAt,
          endedAt,
          startNotificationId,
          endNotificationId,
          blockingConditions: JSON.stringify(blockingConditions),
          blocklists: { connect: blocklistIdRefs },
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
    const {
      startedAt,
      endedAt,
      id,
      name,
      startNotificationId,
      endNotificationId,
      blockingConditions,
      blocklists,
      devices,
    } = dbSession
    assertHHmmString(startedAt)
    assertHHmmString(endedAt)

    return {
      id,
      name,
      startedAt,
      endedAt,
      startNotificationId,
      endNotificationId,
      blockingConditions: JSON.parse(blockingConditions),
      blocklistIds: blocklists.map((b) => b.id),
      devices,
    }
  }

  async findAll(_userId: string): Promise<BlockSession[]> {
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

  async findById(_userId: string, id: string): Promise<BlockSession> {
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

  async update(
    _userId: string,
    payload: UpdatePayload<BlockSession>,
  ): Promise<void> {
    try {
      const {
        blocklistIds: payloadBlocklistIds,
        devices: payloadDevices,
        id,
        name,
        startedAt,
        endedAt,
        startNotificationId,
        endNotificationId,
        blockingConditions,
      } = payload
      const blocklistIds = payloadBlocklistIds?.map((id) => ({ id }))
      const deviceIds = payloadDevices?.map((d) => ({ id: d.id }))

      await this.baseClient.blockSession.update({
        where: { id },
        data: {
          name,
          startedAt,
          endedAt,
          startNotificationId,
          endNotificationId,
          blockingConditions: JSON.stringify(blockingConditions),
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

  async delete(_userId: string, id: string): Promise<void> {
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

  async deleteAll(_userId: string): Promise<void> {
    try {
      const sessions = await this.baseClient.blockSession.findMany({
        select: { id: true },
      })
      const disconnectRelations = sessions.map((s) =>
        this.baseClient.blockSession.update({
          where: { id: s.id },
          data: { blocklists: { set: [] }, devices: { set: [] } },
        }),
      )
      await Promise.all(disconnectRelations)
      await this.baseClient.blockSession.deleteMany()
    } catch (error) {
      this.logger.error(
        `[PrismaBlockSessionRepository] Failed to delete all block sessions: ${error}`,
      )
      throw error
    }
  }
}
