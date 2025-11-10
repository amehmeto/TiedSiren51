import { AuthGateway } from '@/core/ports/auth.gateway'
import { DatabaseService } from '@/core/ports/database.service'
import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'
import { BackgroundTaskService } from '../ports/background-task.service'
import { BlockSessionRepository } from '../ports/block-session.repository'
import { BlocklistRepository } from '../ports/blocklist.repository'
import { InstalledAppRepository } from '../ports/installed-app.repository'
import { NotificationService } from '../ports/notification.service'
import { DateProvider } from '../ports/port.date-provider'
import { SirenTier } from '../ports/siren.tier'
import { SirensRepository } from '../ports/sirens.repository'

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
  sirenTier: SirenTier
  sirensRepository: SirensRepository
}
