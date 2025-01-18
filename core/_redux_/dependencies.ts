import { BlockSessionRepository } from '../ports/block-session.repository'
import { BlocklistRepository } from '../ports/blocklist.repository'
import { SirenTier } from '../ports/siren.tier'
import { DateProvider } from '../ports/port.date-provider'
import { InstalledAppRepository } from '../ports/installed-app.repository'
import { SirensRepository } from '../ports/sirens.repository'
import { NotificationService } from '../ports/notification.service'
import { BackgroundTaskService } from '../ports/background-task.service'
import { AuthGateway } from '@/core/ports/auth.gateway'

export type Dependencies = {
  authGateway: AuthGateway
  blockSessionRepository: BlockSessionRepository
  blocklistRepository: BlocklistRepository
  sirenTier: SirenTier
  dateProvider: DateProvider
  installedAppRepository: InstalledAppRepository
  sirensRepository: SirensRepository
  notificationService: NotificationService
  backgroundTaskService: BackgroundTaskService
}
