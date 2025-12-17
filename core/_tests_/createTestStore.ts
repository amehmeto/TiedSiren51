import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { FakeBackgroundTaskService } from '@/infra/background-task-service/fake.background-task.service'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { FakeDataBlocklistRepository } from '@/infra/blocklist-repository/fake-data.blocklist.repository'
import { StubDatabaseService } from '@/infra/database-service/stub.database.service'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { FakeDataDeviceRepository } from '@/infra/device-repository/fake-data.device.repository'
import { InMemoryForegroundService } from '@/infra/foreground-service/in-memory.foreground.service'
import { FakeDataInstalledAppsRepository } from '@/infra/installed-apps-repository/fake-data.installed-apps.repository'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { FakeNotificationService } from '@/infra/notification-service/fake.notification.service'
import { FakeDataSirensRepository } from '@/infra/siren-repository/fake-data.sirens-repository'
import { FakeDataTimerRepository } from '@/infra/timer-repository/fake-data.timer.repository'
import { InMemorySirenLookout } from '@infra/siren-tier/in-memory.siren-lookout'
import { InMemorySirenTier } from '@infra/siren-tier/in-memory.siren-tier'
import { createStore } from '../_redux_/createStore'
import { Dependencies } from '../_redux_/dependencies'
import { rootReducer } from '../_redux_/rootReducer'

const defaultTestLogger = new InMemoryLogger()

export const createTestStore = (
  {
    authGateway = new FakeAuthGateway(),
    blockSessionRepository = new FakeDataBlockSessionRepository(),
    blocklistRepository = new FakeDataBlocklistRepository(),
    databaseService = new StubDatabaseService(),
    dateProvider = new StubDateProvider(),
    deviceRepository = new FakeDataDeviceRepository(),
    foregroundService = new InMemoryForegroundService(),
    installedAppRepository = new FakeDataInstalledAppsRepository(),
    logger = defaultTestLogger,
    sirenLookout = new InMemorySirenLookout(),
    sirensRepository = new FakeDataSirensRepository(),
    timerRepository = new FakeDataTimerRepository(),
    backgroundTaskService = new FakeBackgroundTaskService(logger),
    notificationService = new FakeNotificationService(logger),
    sirenTier = new InMemorySirenTier(logger),
  }: Partial<Dependencies> = {},
  preloadedState?: Partial<ReturnType<typeof rootReducer>>,
) =>
  createStore(
    {
      authGateway,
      backgroundTaskService,
      blockSessionRepository,
      blocklistRepository,
      databaseService,
      dateProvider,
      deviceRepository,
      foregroundService,
      installedAppRepository,
      logger,
      notificationService,
      sirenLookout,
      sirenTier,
      sirensRepository,
      timerRepository,
    },
    preloadedState,
  )
