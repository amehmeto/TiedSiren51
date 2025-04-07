import { BlockSessionRepository } from '../ports/block-session.repository'
import { BlocklistRepository } from '../ports/blocklist.repository'
import { SirenTier } from '../ports/siren.tier'
import { DateProvider } from '../ports/port.date-provider'
import { InstalledAppRepository } from '../ports/installed-app.repository'
import { SirensRepository } from '../ports/sirens.repository'
import { NotificationService } from '../ports/notification.service'
import { BackgroundTaskService } from '../ports/background-task.service'
import { AuthGateway } from '@/core/ports/auth.gateway'
import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'

export type Dependencies = {
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
