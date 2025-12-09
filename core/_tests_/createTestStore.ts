import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { FakeBackgroundTaskService } from '@/infra/background-task-service/fake.background-task.service'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { FakeDataBlocklistRepository } from '@/infra/blocklist-repository/fake-data.blocklist.repository'
import { StubDatabaseService } from '@/infra/database-service/stub.database.service'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { FakeDataDeviceRepository } from '@/infra/device-repository/fake-data.device.repository'
import { FakeDataInstalledAppsRepository } from '@/infra/installed-apps-repository/fake-data.installed-apps.repository'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { FakeNotificationService } from '@/infra/notification-service/fake.notification.service'
import { FakeDataSirensRepository } from '@/infra/siren-repository/fake-data.sirens-repository'
import { FakeDataTimerRepository } from '@/infra/timer-repository/fake-data.timer.repository'
import { FakeSirenLookout } from '@infra/siren-tier/fake.siren-lookout'
import { InMemorySirenTier } from '@infra/siren-tier/in-memory.siren-tier'
import { createStore } from '../_redux_/createStore'
import { Dependencies } from '../_redux_/dependencies'
import { rootReducer } from '../_redux_/rootReducer'

const testLogger = new InMemoryLogger()

export const createTestStore = (
  {
    authGateway = new FakeAuthGateway(),
    backgroundTaskService = new FakeBackgroundTaskService(testLogger),
    blockSessionRepository = new FakeDataBlockSessionRepository(),
    blocklistRepository = new FakeDataBlocklistRepository(),
    databaseService = new StubDatabaseService(),
    dateProvider = new StubDateProvider(),
    deviceRepository = new FakeDataDeviceRepository(),
    installedAppRepository = new FakeDataInstalledAppsRepository(),
    notificationService = new FakeNotificationService(testLogger),
    sirenLookout = new FakeSirenLookout(),
    sirenTier = new InMemorySirenTier(testLogger),
    sirensRepository = new FakeDataSirensRepository(),
    timerRepository = new FakeDataTimerRepository(),
  }: Partial<Dependencies> = {},
  preloadedState?: Partial<ReturnType<typeof rootReducer>>,
) =>
  createStore(
    {
      databaseService,
      authGateway,
      backgroundTaskService,
      blockSessionRepository,
      blocklistRepository,
      dateProvider,
      deviceRepository,
      installedAppRepository,
      logger: testLogger,
      notificationService,
      sirenLookout,
      sirenTier,
      sirensRepository,
      timerRepository,
    },
    preloadedState,
  )
