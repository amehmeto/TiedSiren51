import { AuthGateway } from '@/core/_ports_/auth.gateway'
import { BackgroundTaskService } from '@/core/_ports_/background-task.service'
import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { BlocklistRepository } from '@/core/_ports_/blocklist.repository'
import { DatabaseService } from '@/core/_ports_/database.service'
import { InstalledAppRepository } from '@/core/_ports_/installed-app.repository'
import { NotificationService } from '@/core/_ports_/notification.service'
import { DateProvider } from '@/core/_ports_/port.date-provider'
import { RemoteDeviceRepository } from '@/core/_ports_/remote-device.repository'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { SirenTier } from '@/core/_ports_/siren.tier'
import { SirensRepository } from '@/core/_ports_/sirens.repository'

export type Dependencies = {
  databaseService: DatabaseService
  authGateway: AuthGateway
  backgroundTaskService: BackgroundTaskService
  blockSessionRepository: BlockSessionRepository
  blocklistRepository: BlocklistRepository
  dateProvider: DateProvider
  deviceRepository: RemoteDeviceRepository
  installedAppRepository: InstalledAppRepository
  notificationService: NotificationService
  sirenLookout: SirenLookout
  sirenTier: SirenTier
  sirensRepository: SirensRepository
}
