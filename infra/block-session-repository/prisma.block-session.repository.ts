import { BlockSession } from '@/core/block-session/block.session'
import { BlockSessionRepository } from '@/core/ports/block-session.repository'
import { UpdatePayload } from '@/core/ports/update.payload'
import { CreatePayload } from '@/core/ports/create.payload'
import uuid from 'react-native-uuid'
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
  async create(
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    const blocklistIds = sessionPayload.blocklists.map((b) => ({
      where: { id: b.id },
      create: {
        id: b.id,
        name: b.name,
        sirens: JSON.stringify(b.sirens || {}),
      },
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
        blockingConditions: JSON.stringify(
          sessionPayload.blockingConditions || [],
        ),
        blocklists: {
          connectOrCreate: blocklistIds,
        },
        devices: {
          connectOrCreate: deviceIds,
        },
      },
      include: {
        blocklists: true,
        devices: true,
      },
    })

    return this.mapToBlockSession(created)
  }

  private mapToBlockSession(dbSession: DbBlockSession): BlockSession {
    return {
      id: dbSession.id,
      name: dbSession.name,
      startedAt: dbSession.startedAt,
      endedAt: dbSession.endedAt,
      startNotificationId: dbSession.startNotificationId,
      endNotificationId: dbSession.endNotificationId,
      blockingConditions: JSON.parse(dbSession.blockingConditions),
      blocklists: dbSession.blocklists.map((b) => ({
        ...b,
        sirens: JSON.parse(b.sirens),
      })),
      devices: dbSession.devices,
    }
  }

  async findAll(): Promise<BlockSession[]> {
    const sessions = await this.baseClient.blockSession.findMany({
      include: {
        blocklists: true,
        devices: true,
      },
    })

    return sessions.map(this.mapToBlockSession)
  }

  async findById(id: string): Promise<BlockSession> {
    const session = await this.baseClient.blockSession.findUnique({
      where: { id },
      include: {
        blocklists: true,
        devices: true,
      },
    })

    if (!session) throw new Error(`Session with id ${id} not found`)

    return this.mapToBlockSession(session)
  }

  async update(payload: UpdatePayload<BlockSession>): Promise<void> {
    const blocklistIds = payload.blocklists?.map((b) => ({ id: b.id }))
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
  }

  async delete(id: string): Promise<void> {
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
  }
}
