/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'
import { BlockSession } from '@/core/block-session/block.session'
import { BlockSessionRepository } from '@/core/ports/block-session.repository'
import { UpdatePayload } from '@/core/ports/update.payload'
import { CreatePayload } from '@/core/ports/create.payload'

export class PrismaBlockSessionRepository implements BlockSessionRepository {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient()
  }

  async findAll(): Promise<BlockSession[]> {
    return Promise.resolve([])
  }

  async create(
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        return tx.blockSession.create({
          data: {
            name: sessionPayload.name,
            startedAt: sessionPayload.startedAt,
            endedAt: sessionPayload.endedAt,
            startNotificationId: sessionPayload.startNotificationId,
            endNotificationId: sessionPayload.endNotificationId,
            blockingConditions: JSON.stringify(
              sessionPayload.blockingConditions,
            ),
            blocklists: {
              connect:
                sessionPayload.blocklists?.map((blocklist) => ({
                  id: blocklist.id,
                })) || [],
            },
            devices: {
              connect:
                sessionPayload.devices?.map((device) => ({
                  id: device.id,
                })) || [],
            },
          },
          include: {
            blocklists: true,
            devices: true,
          },
        })
      })

      return {
        ...created,
        blockingConditions: JSON.parse(created.blockingConditions),
        blocklists: created.blocklists.map((blocklist) => ({
          ...blocklist,
          sirens: JSON.parse(blocklist.sirens),
        })),
        devices: created.devices,
      }
    } catch (error) {
      console.error('Error creating block session:', error)
      throw new Error('Failed to create block session')
    }
  }

  async findById(id: string): Promise<BlockSession> {
    const session = await this.prisma.blockSession.findUnique({
      where: { id },
    })

    if (!session) {
      throw new Error(`BlockSession with id ${id} not found`)
    }

    return {
      id: session.id,
      name: session.name,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      startNotificationId: session.startNotificationId,
      endNotificationId: session.endNotificationId,
      blockingConditions: JSON.parse(session.blockingConditions),
      blocklists: [],
      devices: [],
    }
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
}
