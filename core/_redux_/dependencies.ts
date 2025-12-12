import { AuthGateway } from '@/core/_ports_/auth.gateway'
import { BackgroundTaskService } from '@/core/_ports_/background-task.service'
import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { BlocklistRepository } from '@/core/_ports_/blocklist.repository'
import { DatabaseService } from '@/core/_ports_/database.service'
import { DateProvider } from '@/core/_ports_/date-provider'
import { InstalledAppRepository } from '@/core/_ports_/installed-app.repository'
import { Logger } from '@/core/_ports_/logger'
import { NotificationService } from '@/core/_ports_/notification.service'
import { RemoteDeviceRepository } from '@/core/_ports_/remote-device.repository'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { SirenTier } from '@/core/_ports_/siren.tier'
import { SirensRepository } from '@/core/_ports_/sirens.repository'
import { TimerRepository } from '@/core/_ports_/timer.repository'

export type Dependencies = {
  authGateway: AuthGateway
  backgroundTaskService: BackgroundTaskService
  blockSessionRepository: BlockSessionRepository
  blocklistRepository: BlocklistRepository
  databaseService: DatabaseService
  dateProvider: DateProvider
  deviceRepository: RemoteDeviceRepository
  installedAppRepository: InstalledAppRepository
  logger: Logger
  notificationService: NotificationService
  sirenLookout: SirenLookout
  sirenTier: SirenTier
  sirensRepository: SirensRepository
  timerRepository: TimerRepository
}
