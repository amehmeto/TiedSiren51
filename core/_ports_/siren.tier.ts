import { Sirens } from '@core/siren/sirens'

export interface SirenTier {
  /**
   * Configure which sirens should be targeted for blocking
   */
  target(sirens: Sirens): Promise<void>

  /**
   * Block a specific app right now (show overlay)
   * Stateless - just shows the blocking UI
   */
  block(packageName: string): Promise<void>
}
