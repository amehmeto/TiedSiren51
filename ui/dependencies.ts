import { Dependencies } from '@/core/_redux_/dependencies'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { FirebaseAuthGateway } from '@/infra/auth-gateway/firebase.auth.gateway'
import { PowersyncBlockSessionRepository } from '@/infra/block-session-repository/powersync.block-session.repository'
import { PowersyncBlocklistRepository } from '@/infra/blocklist-repository/powersync.blocklist.repository'
import { InMemoryConsentRepository } from '@/infra/consent-repository/in-memory.consent.repository'
import { PowersyncConsentRepository } from '@/infra/consent-repository/powersync.consent.repository'
import { PowerSyncDatabaseService } from '@/infra/database-service/powersync.database.service'
import { RealDateProvider } from '@/infra/date-provider/real.date-provider'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { PowersyncRemoteDeviceRepository } from '@/infra/device-repository/powersync.remote-device.repository'
import { FirebaseFeatureFlagProvider } from '@/infra/feature-flag-provider/firebase.feature-flag.provider'
import { InMemoryFeatureFlagProvider } from '@/infra/feature-flag-provider/in-memory.feature-flag.provider'
import { AndroidForegroundService } from '@/infra/foreground-service/android.foreground.service'
import { ExpoListInstalledAppsRepository } from '@/infra/installed-apps-repository/expo-list-installed-apps.repository'
import { FakeDataInstalledAppsRepository } from '@/infra/installed-apps-repository/fake-data.installed-apps.repository'
import { SentryLogger } from '@/infra/logger/sentry.logger'
import { ExpoNotificationService } from '@/infra/notification-service/expo.notification.service'
import { PowersyncSirensRepository } from '@/infra/siren-repository/powersync.sirens-repository'
import { RealAndroidSirenLookout } from '@/infra/siren-tier/android.siren-lookout'
import { AndroidSirenTier } from '@/infra/siren-tier/android.siren-tier'
import { PowersyncTimerRepository } from '@/infra/timer-repository/powersync.timer.repository'

const logger = new SentryLogger()

const dateProvider = new RealDateProvider()

const databaseService = new PowerSyncDatabaseService(logger)
const db = databaseService.getDatabase()

const androidDependencies: Dependencies = {
  authGateway: new FirebaseAuthGateway(logger),
  blockSessionRepository: new PowersyncBlockSessionRepository(db, logger),
  blocklistRepository: new PowersyncBlocklistRepository(db, logger),
  consentRepository: new PowersyncConsentRepository(db, logger),
  databaseService,
  dateProvider,
  deviceRepository: new PowersyncRemoteDeviceRepository(db, logger),
  featureFlagProvider: new FirebaseFeatureFlagProvider(logger),
  foregroundService: new AndroidForegroundService(logger),
  installedAppRepository: new ExpoListInstalledAppsRepository(logger),
  logger,
  notificationService: new ExpoNotificationService(logger),
  sirenLookout: new RealAndroidSirenLookout(logger),
  sirenTier: new AndroidSirenTier(logger, dateProvider),
  sirensRepository: new PowersyncSirensRepository(db, logger),
  timerRepository: new PowersyncTimerRepository(db, logger),
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
  blockSessionRepository: new PowersyncBlockSessionRepository(db, logger),
  blocklistRepository: new PowersyncBlocklistRepository(db, logger),
  consentRepository: new InMemoryConsentRepository(),
  databaseService,
  dateProvider: e2eDateProvider,
  deviceRepository: new PowersyncRemoteDeviceRepository(db, logger),
  featureFlagProvider: new InMemoryFeatureFlagProvider(),
  foregroundService: new AndroidForegroundService(logger),
  installedAppRepository: new FakeDataInstalledAppsRepository(),
  logger,
  notificationService: new ExpoNotificationService(logger),
  sirenLookout: new RealAndroidSirenLookout(logger),
  sirenTier: new AndroidSirenTier(logger, e2eDateProvider),
  sirensRepository: new PowersyncSirensRepository(db, logger),
  timerRepository: new PowersyncTimerRepository(db, logger),
}

export const dependencies: Dependencies = process.env.EXPO_PUBLIC_E2E
  ? e2eTestsDependencies
  : androidDependencies
