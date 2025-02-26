import { FakeDataInstalledAppsRepository } from '@/infra/installed-apps-repository/fake-data.installed-apps.repository'
import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'
import { RealDateProvider } from '@/infra/date-provider/real.date-provider'
import { Dependencies } from '@/core/_redux_/dependencies'
import { FakeDataSirensRepository } from '@/infra/sirens-repository/fake-data.sirens-repository'
import { ExpoNotificationService } from '@/infra/notification-service/expo.notification.service'
import { InMemorySirenTier } from '@/infra/siren-tier/in-memory-siren.tier'
import { RealBackgroundTaskService } from '@/infra/background-task-service/real.background-task.service'

import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { PrismaBlocklistRepository } from '@/infra/blocklist-repository/prisma.blocklist.repository'
import { PrismaBlockSessionRepository } from '@/infra/block-session-repository/prisma.block-session.repository'
import { PrismaRemoteDeviceRepository } from '@/infra/device-repository/prisma.remote-device.repository'

export const deviceRepository: RemoteDeviceRepository =
  new PrismaRemoteDeviceRepository() //FakeDataDeviceRepository()

export const dependencies: Dependencies = {
  authGateway: new FakeAuthGateway(),
  blockSessionRepository: new PrismaBlockSessionRepository(), // new PrismaBlockSessionRepository(),
  blocklistRepository: new PrismaBlocklistRepository(), // Pass PrismaClient instance
  sirenTier: new InMemorySirenTier(),
  dateProvider: new RealDateProvider(),
  installedAppRepository: new FakeDataInstalledAppsRepository(),
  sirensRepository: new FakeDataSirensRepository(),
  notificationService: new ExpoNotificationService(),
  backgroundTaskService: new RealBackgroundTaskService(),
}
