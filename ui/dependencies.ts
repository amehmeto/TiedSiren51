import { Dependencies } from '@/core/_redux_/dependencies'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { FirebaseAuthGateway } from '@/infra/auth-gateway/firebase.auth.gateway'
import { RealBackgroundTaskService } from '@/infra/background-task-service/real.background-task.service'
import { PrismaBlockSessionRepository } from '@/infra/block-session-repository/prisma.block-session.repository'
import { PrismaBlocklistRepository } from '@/infra/blocklist-repository/prisma.blocklist.repository'
import { PrismaDatabaseService } from '@/infra/database-service/prisma.database.service'
import { RealDateProvider } from '@/infra/date-provider/real.date-provider'
import { PrismaRemoteDeviceRepository } from '@/infra/device-repository/prisma.remote-device.repository'
import { ExpoListInstalledAppsRepository } from '@/infra/installed-apps-repository/expo-list-installed-apps.repository'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { ExpoNotificationService } from '@/infra/notification-service/expo.notification.service'
import { PrismaSirensRepository } from '@/infra/siren-repository/prisma.sirens-repository'
import { InMemorySirenLookout } from '@/infra/siren-tier/in-memory.siren-lookout'
import { InMemorySirenTier } from '@/infra/siren-tier/in-memory.siren-tier'
import { PrismaTimerRepository } from '@/infra/timer-repository/prisma.timer.repository'

const dateProvider = new RealDateProvider()
const logger = new InMemoryLogger(dateProvider)

const mobileDependencies = {
  authGateway: process.env.EXPO_PUBLIC_E2E
    ? new FakeAuthGateway()
    : new FirebaseAuthGateway(),
  backgroundTaskService: new RealBackgroundTaskService(logger),
  blockSessionRepository: new PrismaBlockSessionRepository(logger),
  blocklistRepository: new PrismaBlocklistRepository(logger),
  databaseService: new PrismaDatabaseService(logger),
  dateProvider,
  deviceRepository: new PrismaRemoteDeviceRepository(logger),
  installedAppRepository: new ExpoListInstalledAppsRepository(),
  notificationService: new ExpoNotificationService(logger),
  sirenLookout: new InMemorySirenLookout(logger),
  sirenTier: new InMemorySirenTier(logger),
  sirensRepository: new PrismaSirensRepository(logger),
  timerRepository: new PrismaTimerRepository(logger),
}

export const dependencies: Dependencies = mobileDependencies
