import { Logger } from '@/core/_ports_/logger'
import { DetectedSiren, SirenLookout } from '@/core/_ports_/siren.lookout'

/**
 * Listens for siren detection events from the native layer.
 *
 * Note: Actual blocking is handled natively via the blocking schedule
 * synced by onBlockSessionsChangedListener. This listener is for
 * logging/analytics purposes only.
 */
export const onSirenDetectedListener = ({
  sirenLookout,
  logger,
}: {
  sirenLookout: SirenLookout
  logger: Logger
}) => {
  sirenLookout.onSirenDetected((siren: DetectedSiren) => {
    try {
      logger.info(
        `[onSirenDetectedListener] Detected ${siren.type}: ${siren.identifier}`,
      )
    } catch (error) {
      logger.error(
        `[onSirenDetectedListener] Failed to log detection: ${error}`,
      )
    }
  })
}
