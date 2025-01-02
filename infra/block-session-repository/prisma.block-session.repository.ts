import { PrismaClient } from '@prisma/client'
import { BlockSession } from '@/core/block-session/block.session'
import { BlockSessionRepository } from '@/core/ports/block-session.repository'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Device } from '@/core/device/device'
import { UpdatePayload } from '@/core/ports/update.payload'

type BlockSessionCreateInput = Omit<
  BlockSession,
  'id' | 'blocklists' | 'devices'
> & {
  blocklists: Omit<Blocklist, 'id'>[]
  devices: Omit<Device, 'id'>[]
}

export class PrismaBlockSessionRepository implements BlockSessionRepository {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient()
  }

  async create(sessionPayload: BlockSessionCreateInput): Promise<BlockSession> {
    const created = await this.prisma.blockSession.create({
      data: {
        name: sessionPayload.name,
        startedAt: sessionPayload.startedAt,
        endedAt: sessionPayload.endedAt,
        startNotificationId: sessionPayload.startNotificationId,
        endNotificationId: sessionPayload.endNotificationId,
        blockingConditions: JSON.stringify(sessionPayload.blockingConditions),
        blocklists: {
          create: sessionPayload.blocklists.map((bl) => ({
            name: bl.name,
            sirens: JSON.stringify(bl.sirens),
          })),
        },
        devices: {
          create: sessionPayload.devices.map((dev) => ({
            name: dev.name,
            type: dev.type,
          })),
        },
      },
      include: {
        blocklists: true,
        devices: true,
      },
    })

    return this.mapToBlockSession(created)
  }

  async findById(id: string): Promise<BlockSession> {
    const session = await this.prisma.blockSession.findUnique({
      where: { id },
      include: {
        blocklists: true,
        devices: true,
      },
    })

    if (!session) {
      throw new Error(`BlockSession with id ${id} not found`)
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
        startedAt: sessionPayload.startedAt,
        endedAt: sessionPayload.endedAt,
        startNotificationId: sessionPayload.startNotificationId,
        endNotificationId: sessionPayload.endNotificationId,
        blockingConditions: sessionPayload.blockingConditions
          ? JSON.stringify(sessionPayload.blockingConditions)
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
      devices: prismaSession.devices,
    }
  }
}
