import { Prisma } from '@prisma/client'

declare global {
  namespace PrismaNamespace {
    type Device = Prisma.DeviceGetPayload<{}>
    type Siren = Prisma.SirenGetPayload<{}>
    type BlockSession = Prisma.BlockSessionGetPayload<{}>
    type Blocklist = Prisma.BlocklistGetPayload<{}>
  }
}
