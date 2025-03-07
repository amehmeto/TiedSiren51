import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'
import { RealDateProvider } from '@/infra/date-provider/real.date-provider'
import { Dependencies } from '@/core/_redux_/dependencies'
import { ExpoNotificationService } from '@/infra/notification-service/expo.notification.service'
import { InMemorySirenTier } from '@/infra/siren-tier/in-memory-siren.tier'
import { RealBackgroundTaskService } from '@/infra/background-task-service/real.background-task.service'

import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { ExpoListInstalledAppsRepository } from '@/infra/installed-apps-repository/expo-list-installed-apps.repository'
import { PrismaBlocklistRepository } from '@/infra/blocklist-repository/prisma.blocklist.repository'
import { PrismaBlockSessionRepository } from '@/infra/block-session-repository/prisma.block-session.repository'
import { PrismaRemoteDeviceRepository } from '@/infra/device-repository/prisma.remote-device.repository'
import { PrismaSirensRepository } from '@/infra/sirens-repository/prisma.sirens-repository'

export const deviceRepository: RemoteDeviceRepository =
  new PrismaRemoteDeviceRepository()

export const dependencies: Dependencies = {
  authGateway: new FakeAuthGateway(),
  blockSessionRepository: new PrismaBlockSessionRepository(),
  blocklistRepository: new PrismaBlocklistRepository(),
  sirenTier: new InMemorySirenTier(),
  dateProvider: new RealDateProvider(),
  installedAppRepository: new ExpoListInstalledAppsRepository(),
  sirensRepository: new PrismaSirensRepository(),
  notificationService: new ExpoNotificationService(),
  backgroundTaskService: new RealBackgroundTaskService(),
}
