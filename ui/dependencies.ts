import { FakeDataInstalledAppsRepository } from '@/infra/installed-apps-repository/fake-data.installed-apps.repository'
import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'
import { FakeDataDeviceRepository } from '@/infra/device-repository/fake-data.device.repository'
import { RealDateProvider } from '@/infra/date-provider/real.date-provider'
import { Dependencies } from '@/core/_redux_/dependencies'
import { FakeDataSirensRepository } from '@/infra/sirens-repository/fake-data.sirens-repository'
import { ExpoNotificationService } from '@/infra/notification-service/expo.notification.service'
import { InMemorySirenTier } from '@/infra/siren-tier/in-memory-siren.tier'
import { RealBackgroundTaskService } from '@/infra/background-task-service/real.background-task.service'
import { PouchdbBlockSessionRepository } from '@/infra/block-session-repository/pouchdb.block-session.repository'
import { PouchdbBlocklistRepository } from '@/infra/blocklist-repository/pouchdb.blocklist.repository'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { FakeDataBlocklistRepository } from '@/infra/blocklist-repository/fake-data.blocklist.repository'

export const deviceRepository: RemoteDeviceRepository =
  new FakeDataDeviceRepository()

export const dependencies: Dependencies = {
  blockSessionRepository: new FakeDataBlockSessionRepository(), // new PouchdbBlockSessionRepository(),
  blocklistRepository: new FakeDataBlocklistRepository(), //PouchdbBlocklistRepository(),
  sirenTier: new InMemorySirenTier(),
  dateProvider: new RealDateProvider(),
  installedAppRepository: new FakeDataInstalledAppsRepository(),
  sirensRepository: new FakeDataSirensRepository(),
  notificationService: new ExpoNotificationService(),
  backgroundTaskService: new RealBackgroundTaskService(),
}
