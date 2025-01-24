import { createStore } from '../_redux_/createStore'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { rootReducer } from '../_redux_/rootReducer'
import { FakeDataBlocklistRepository } from '@/infra/blocklist-repository/fake-data.blocklist.repository'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { Dependencies } from '../_redux_/dependencies'
import { FakeDataInstalledAppsRepository } from '@/infra/installed-apps-repository/fake-data.installed-apps.repository'
import { FakeDataSirensRepository } from '@/infra/sirens-repository/fake-data.sirens-repository'
import { FakeNotificationService } from '@/infra/notification-service/fake.notification.service'
import { InMemorySirenTier } from '@/infra/siren-tier/in-memory-siren.tier'
import { FakeBackgroundTaskService } from '@/infra/background-task-service/fake.background-task.service'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'

export const createTestStore = (
  {
    authGateway = new FakeAuthGateway(),
    blockSessionRepository = new FakeDataBlockSessionRepository(),
    blocklistRepository = new FakeDataBlocklistRepository(),
    sirenTier = new InMemorySirenTier(),
    dateProvider = new StubDateProvider(),
    installedAppRepository = new FakeDataInstalledAppsRepository(),
    sirensRepository = new FakeDataSirensRepository(),
    notificationService = new FakeNotificationService(),
    backgroundTaskService = new FakeBackgroundTaskService(),
  }: Partial<Dependencies> = {},
  preloadedState?: Partial<ReturnType<typeof rootReducer>>,
) =>
  createStore(
    {
      authGateway,
      blockSessionRepository,
      blocklistRepository,
      sirenTier,
      dateProvider,
      installedAppRepository,
      sirensRepository,
      notificationService,
      backgroundTaskService,
    },
    preloadedState,
  )
