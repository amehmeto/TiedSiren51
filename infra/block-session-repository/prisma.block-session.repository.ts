/* eslint-disable no-console */
import { BlockSession } from '@/core/block-session/block.session'
import { BlockSessionRepository } from '@/core/ports/block-session.repository'
import { UpdatePayload } from '@/core/ports/update.payload'
import { CreatePayload } from '@/core/ports/create.payload'
import { extendedClient } from '@/myDbModule'
import { Sirens } from '@/core/siren/sirens'

export class PrismaBlockSessionRepository implements BlockSessionRepository {
  private prisma = extendedClient

  async create(
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    try {
      console.log('Creating block session:', sessionPayload)

      // Extract the IDs for many-to-many relations
      const blocklistIds = sessionPayload.blocklists.map((b) => ({ id: b.id }))
      const deviceIds = sessionPayload.devices.map((d) => ({ id: d.id }))

      const created = await this.prisma.blockSession.create({
        data: {
          name: sessionPayload.name,
          startedAt: sessionPayload.startedAt,
          endedAt: sessionPayload.endedAt,
          startNotificationId: sessionPayload.startNotificationId,
          endNotificationId: sessionPayload.endNotificationId,
          blockingConditions: JSON.stringify(
            sessionPayload.blockingConditions || [],
          ),
          blocklists: {
            connect: blocklistIds,
          },
          devices: {
            connect: deviceIds,
          },
        },
        include: {
          blocklists: true,
          devices: true,
        },
      })

      return {
        id: created.id,
        name: created.name,
        startedAt: created.startedAt,
        endedAt: created.endedAt,
        startNotificationId: created.startNotificationId,
        endNotificationId: created.endNotificationId,
        blockingConditions: JSON.parse(created.blockingConditions),
        blocklists: created.blocklists.map((b) => ({
          ...b,
          sirens: JSON.parse(b.sirens) as Sirens,
        })),
        devices: created.devices,
      } as BlockSession
    } catch (error) {
      console.error('Create error:', error)
      throw error
    }
  }

  async findAll(): Promise<BlockSession[]> {
    try {
      console.log('Fetching block sessions...')
      const sessions = await this.prisma.blockSession.findMany({
        include: {
          blocklists: true,
          devices: true,
        },
      })

      return sessions.map((session) => ({
        id: session.id,
        name: session.name,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        startNotificationId: session.startNotificationId,
        endNotificationId: session.endNotificationId,
        blockingConditions: JSON.parse(session.blockingConditions),
        blocklists: session.blocklists.map((b) => ({
          ...b,
          sirens: JSON.parse(b.sirens) as Sirens,
        })),
        devices: session.devices,
      }))
    } catch (error) {
      console.error('FindAll error:', error)
      throw error
    }
  }

  async findById(id: string): Promise<BlockSession> {
    try {
      const session = await this.prisma.blockSession.findUnique({
        where: { id },
        include: {
          blocklists: true,
          devices: true,
        },
      })

      if (!session) {
        throw new Error(`BlockSession ${id} not found`)
      }

      return {
        id: session.id,
        name: session.name,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        startNotificationId: session.startNotificationId,
        endNotificationId: session.endNotificationId,
        blockingConditions: JSON.parse(session.blockingConditions),
        blocklists: session.blocklists.map((b) => ({
          ...b,
          sirens: JSON.parse(b.sirens) as Sirens,
        })),
        devices: session.devices,
      } as BlockSession
    } catch (error) {
      console.error('FindById error:', error)
      throw error
    }
  }

  async update(payload: UpdatePayload<BlockSession>): Promise<void> {
    try {
      const blocklistIds = payload.blocklists?.map((b) => ({ id: b.id }))
      const deviceIds = payload.devices?.map((d) => ({ id: d.id }))

      await this.prisma.blockSession.update({
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
      console.error('Update error:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.blockSession.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Delete error:', error)
      throw error
    }
  }
}
