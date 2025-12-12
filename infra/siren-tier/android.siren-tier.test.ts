import { showOverlay } from '@amehmeto/tied-siren-blocking-overlay'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSirens } from '@/core/_tests_/data-builders/sirens.builder'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { AndroidSirenTier } from './android.siren-tier'

vi.mock('@amehmeto/tied-siren-blocking-overlay', () => ({
  showOverlay: vi.fn(),
}))

const mockShowOverlay = vi.mocked(showOverlay)

describe('AndroidSirenTier', () => {
  let androidSirenTier: AndroidSirenTier
  let logger: InMemoryLogger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = new InMemoryLogger()
    androidSirenTier = new AndroidSirenTier(logger)
  })

  describe('block', () => {
    it('calls showOverlay with correct packageName', async () => {
      const packageName = 'com.facebook.katana'
      mockShowOverlay.mockResolvedValueOnce(undefined)

      await androidSirenTier.block(packageName)

      expect(mockShowOverlay).toHaveBeenCalledTimes(1)
      expect(mockShowOverlay).toHaveBeenCalledWith(packageName)
    })

    it('handles ERR_INVALID_PACKAGE error gracefully', async () => {
      const error = Object.assign(new Error('Package name cannot be empty'), {
        code: 'ERR_INVALID_PACKAGE',
      })
      mockShowOverlay.mockRejectedValueOnce(error)

      const blockPromise = androidSirenTier.block('')

      await expect(blockPromise).rejects.toThrow('Package name cannot be empty')
    })

    it('handles ERR_OVERLAY_LAUNCH error gracefully', async () => {
      const error = Object.assign(new Error('Failed to launch overlay'), {
        code: 'ERR_OVERLAY_LAUNCH',
      })
      mockShowOverlay.mockRejectedValueOnce(error)

      const blockPromise = androidSirenTier.block('com.example.app')

      await expect(blockPromise).rejects.toThrow('Failed to launch overlay')
    })
  })

  describe('target', () => {
    it('logs targeted sirens', async () => {
      const sirens = buildSirens({
        android: [
          { appName: 'Facebook', packageName: 'com.facebook.katana', icon: '' },
          {
            appName: 'Instagram',
            packageName: 'com.instagram.android',
            icon: '',
          },
        ],
      })
      const expectedLogEntry = {
        level: 'info',
        message: 'Targeted sirens: Facebook, Instagram',
      }

      await androidSirenTier.target(sirens)

      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })
  })
})
