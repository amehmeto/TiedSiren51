import { PrismaClient } from '@prisma/client'
import { BlockSession } from '@/core/block-session/block.session'
import { BlockSessionRepository } from '@/core/ports/block-session.repository'
import { CreatePayload } from '@/core/ports/create.payload'
import { UpdatePayload } from '@/core/ports/update.payload'

export class PrismaBlockSessionRepository implements BlockSessionRepository {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient()
  }

  async create(
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    const created = await this.prisma.blockSession.create({
      data: {
        name: sessionPayload.name,
        // minutesLeft: sessionPayload.minutesLeft,
        startedAt: sessionPayload.startedAt,
        endedAt: sessionPayload.endedAt,
        startNotificationId: sessionPayload.startNotificationId,
        endNotificationId: sessionPayload.endNotificationId,
        blockingConditions: JSON.stringify(
          sessionPayload.blockingConditions || [],
        ),
        blocklists: {
          connect:
            sessionPayload.blocklists?.map((list) => ({ id: list.id })) || [],
        },
        devices: {
          connect:
            sessionPayload.devices?.map((device) => ({ id: device.id })) || [],
        },
      },
      include: {
        blocklists: true,
        devices: true,
      },
    })

    return this.mapToBlockSession(created)
  }

  async findById(sessionId: string): Promise<BlockSession> {
    const session = await this.prisma.blockSession.findUnique({
      where: { id: sessionId },
      include: {
        blocklists: true,
        devices: true,
      },
    })

    if (!session) {
      throw new Error(`BlockSession with id ${sessionId} not found`)
    }
    return this.mapToBlockSession(session)
  }

  async findAll(): Promise<BlockSession[]> {
    const sessions = await this.prisma.blockSession.findMany({
      include: {
        blocklists: true,
        devices: true,
      },
    })

    return sessions.map(this.mapToBlockSession)
  }

  async update(sessionPayload: UpdatePayload<BlockSession>): Promise<void> {
    await this.prisma.blockSession.update({
      where: { id: sessionPayload.id },
      data: {
        name: sessionPayload.name,
        // minutesLeft: sessionPayload.minutesLeft,
        startedAt: sessionPayload.startedAt,
        endedAt: sessionPayload.endedAt,
        startNotificationId: sessionPayload.startNotificationId,
        endNotificationId: sessionPayload.endNotificationId,
        blockingConditions: sessionPayload.blockingConditions
          ? JSON.stringify(sessionPayload.blockingConditions)
          : undefined,
        blocklists: sessionPayload.blocklists
          ? { set: sessionPayload.blocklists.map((list) => ({ id: list.id })) }
          : undefined,
        devices: sessionPayload.devices
          ? { set: sessionPayload.devices.map((device) => ({ id: device.id })) }
          : undefined,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.blockSession.delete({
      where: { id },
    })
  }

  private mapToBlockSession(prismaSession: any): BlockSession {
    return {
      id: prismaSession.id,
      name: prismaSession.name,
      startedAt: prismaSession.startedAt,
      endedAt: prismaSession.endedAt,
      startNotificationId: prismaSession.startNotificationId,
      endNotificationId: prismaSession.endNotificationId,
      blockingConditions: JSON.parse(prismaSession.blockingConditions),
      blocklists: prismaSession.blocklists.map((bl: any) => ({
        id: bl.id,
        name: bl.name,
        sirens: JSON.parse(bl.sirens),
      })),
      devices: prismaSession.devices.map((dev: any) => ({
        id: dev.id,
        name: dev.name,
        type: dev.type,
      })),
    }
  }
}
