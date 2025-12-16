import { Dependencies } from '@/core/_redux_/dependencies'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { FirebaseAuthGateway } from '@/infra/auth-gateway/firebase.auth.gateway'
import { RealBackgroundTaskService } from '@/infra/background-task-service/real.background-task.service'
import { PrismaBlockSessionRepository } from '@/infra/block-session-repository/prisma.block-session.repository'
import { PrismaBlocklistRepository } from '@/infra/blocklist-repository/prisma.blocklist.repository'
import { PrismaDatabaseService } from '@/infra/database-service/prisma.database.service'
import { RealDateProvider } from '@/infra/date-provider/real.date-provider'
import { PrismaRemoteDeviceRepository } from '@/infra/device-repository/prisma.remote-device.repository'
import { AndroidForegroundService } from '@/infra/foreground-service/android.foreground.service'
import { ExpoListInstalledAppsRepository } from '@/infra/installed-apps-repository/expo-list-installed-apps.repository'
import { SentryLogger } from '@/infra/logger/sentry.logger'
import { ExpoNotificationService } from '@/infra/notification-service/expo.notification.service'
import { PrismaSirensRepository } from '@/infra/siren-repository/prisma.sirens-repository'
import { AndroidSirenTier } from '@/infra/siren-tier/android.siren-tier'
import { RealAndroidSirenLookout } from '@/infra/siren-tier/real-android.siren-lookout'
import { PrismaTimerRepository } from '@/infra/timer-repository/prisma.timer.repository'

const dateProvider = new RealDateProvider()
const logger = new SentryLogger()

const mobileDependencies = {
  authGateway: process.env.EXPO_PUBLIC_E2E
    ? new FakeAuthGateway()
    : new FirebaseAuthGateway(logger),
  backgroundTaskService: new RealBackgroundTaskService(logger),
  blockSessionRepository: new PrismaBlockSessionRepository(logger),
  blocklistRepository: new PrismaBlocklistRepository(logger),
  databaseService: new PrismaDatabaseService(logger),
  dateProvider,
  deviceRepository: new PrismaRemoteDeviceRepository(logger),
  foregroundService: new AndroidForegroundService(logger),
  installedAppRepository: new ExpoListInstalledAppsRepository(logger),
  logger,
  notificationService: new ExpoNotificationService(logger),
  sirenLookout: new RealAndroidSirenLookout(logger),
  sirenTier: new AndroidSirenTier(logger),
  sirensRepository: new PrismaSirensRepository(logger),
  timerRepository: new PrismaTimerRepository(logger),
}

export const dependencies: Dependencies = mobileDependencies
