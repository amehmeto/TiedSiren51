import { Dependencies } from '@/core/_redux_/dependencies'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { FirebaseAuthGateway } from '@/infra/auth-gateway/firebase.auth.gateway'
import { RealBackgroundTaskService } from '@/infra/background-task-service/real.background-task.service'
import { PrismaBlockSessionRepository } from '@/infra/block-session-repository/prisma.block-session.repository'
import { PrismaBlocklistRepository } from '@/infra/blocklist-repository/prisma.blocklist.repository'
import { PrismaDatabaseService } from '@/infra/database-service/prisma.database.service'
import { RealDateProvider } from '@/infra/date-provider/real.date-provider'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { PrismaRemoteDeviceRepository } from '@/infra/device-repository/prisma.remote-device.repository'
import { AndroidForegroundService } from '@/infra/foreground-service/android.foreground.service'
import { ExpoListInstalledAppsRepository } from '@/infra/installed-apps-repository/expo-list-installed-apps.repository'
import { FakeDataInstalledAppsRepository } from '@/infra/installed-apps-repository/fake-data.installed-apps.repository'
import { SentryLogger } from '@/infra/logger/sentry.logger'
import { ExpoNotificationService } from '@/infra/notification-service/expo.notification.service'
import { PrismaSirensRepository } from '@/infra/siren-repository/prisma.sirens-repository'
import { RealAndroidSirenLookout } from '@/infra/siren-tier/android.siren-lookout'
import { AndroidSirenTier } from '@/infra/siren-tier/android.siren-tier'
import { PrismaTimerRepository } from '@/infra/timer-repository/prisma.timer.repository'

const logger = new SentryLogger()

const androidDateProvider = new RealDateProvider()

const androidDependencies: Dependencies = {
  authGateway: new FirebaseAuthGateway(logger),
  backgroundTaskService: new RealBackgroundTaskService(logger),
  blockSessionRepository: new PrismaBlockSessionRepository(logger),
  blocklistRepository: new PrismaBlocklistRepository(logger),
  databaseService: new PrismaDatabaseService(logger),
  dateProvider: androidDateProvider,
  deviceRepository: new PrismaRemoteDeviceRepository(logger),
  foregroundService: new AndroidForegroundService(logger),
  installedAppRepository: new ExpoListInstalledAppsRepository(logger),
  logger,
  notificationService: new ExpoNotificationService(logger),
  sirenLookout: new RealAndroidSirenLookout(logger),
  sirenTier: new AndroidSirenTier(logger, androidDateProvider),
  sirensRepository: new PrismaSirensRepository(logger),
  timerRepository: new PrismaTimerRepository(logger),
}

function createE2EDateProvider(): StubDateProvider {
  const stubDateProvider = new StubDateProvider()
  // Fixed time: 10:00 AM for predictable E2E tests
  stubDateProvider.now = new Date('2025-01-15T10:00:00.000Z')
  return stubDateProvider
}

const e2eDateProvider = createE2EDateProvider()

const e2eTestsDependencies: Dependencies = {
  authGateway: new FakeAuthGateway(),
  backgroundTaskService: new RealBackgroundTaskService(logger),
  blockSessionRepository: new PrismaBlockSessionRepository(logger),
  blocklistRepository: new PrismaBlocklistRepository(logger),
  databaseService: new PrismaDatabaseService(logger),
  dateProvider: e2eDateProvider,
  deviceRepository: new PrismaRemoteDeviceRepository(logger),
  foregroundService: new AndroidForegroundService(logger),
  installedAppRepository: new FakeDataInstalledAppsRepository(),
  logger,
  notificationService: new ExpoNotificationService(logger),
  sirenLookout: new RealAndroidSirenLookout(logger),
  sirenTier: new AndroidSirenTier(logger, e2eDateProvider),
  sirensRepository: new PrismaSirensRepository(logger),
  timerRepository: new PrismaTimerRepository(logger),
}

export const dependencies: Dependencies = process.env.EXPO_PUBLIC_E2E
  ? e2eTestsDependencies
  : androidDependencies
