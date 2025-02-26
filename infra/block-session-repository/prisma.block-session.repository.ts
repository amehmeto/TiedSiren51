/* eslint-disable no-console */
import { BlockSession } from '@/core/block-session/block.session'
import { BlockSessionRepository } from '@/core/ports/block-session.repository'
import { UpdatePayload } from '@/core/ports/update.payload'
import { CreatePayload } from '@/core/ports/create.payload'
import { extendedClient } from '@/myDbModule'
import { Sirens } from '@/core/siren/sirens'
import uuid from 'react-native-uuid'

export class PrismaBlockSessionRepository implements BlockSessionRepository {
  private prisma = extendedClient

  async create(
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    try {
      console.log('Creating block session:', sessionPayload)

      // Create or connect blocklists and devices
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

      const created = await this.prisma.blockSession.create({
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
    } catch (error) {
      console.error('Create error:', error)
      throw error
    }
  }

  private mapToBlockSession(dbSession: any): BlockSession {
    return {
      id: dbSession.id,
      name: dbSession.name,
      startedAt: dbSession.startedAt,
      endedAt: dbSession.endedAt,
      startNotificationId: dbSession.startNotificationId,
      endNotificationId: dbSession.endNotificationId,
      blockingConditions: JSON.parse(dbSession.blockingConditions),
      blocklists: dbSession.blocklists.map((b: any) => ({
        ...b,
        sirens: JSON.parse(b.sirens) as Sirens,
      })),
      devices: dbSession.devices,
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

  // Add this method to help with debugging
  async checkConnection(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      console.log('Database connection successful')
    } catch (error) {
      console.error('Database connection failed:', error)
      throw error
    }
  }
}
