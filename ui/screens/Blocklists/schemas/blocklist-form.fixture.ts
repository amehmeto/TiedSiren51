import { expect } from 'vitest'
import { z } from 'zod'
import { blocklistSchema } from './blocklist-form.schema'
import { buildBlocklist } from '../../../../core/_tests_/data-builders/blocklist.builder'

export type BlockFormData = z.infer<typeof blocklistSchema>

function buildValidBlocklistFormData(
  overrides: Parameters<typeof buildBlocklist>[0] = {},
): BlockFormData {
  const blocklist = buildBlocklist(overrides)

  return {
    name: blocklist.name,
    sirens: {
      android: blocklist.sirens.android,
      websites: blocklist.sirens.websites,
      keywords: blocklist.sirens.keywords,
    },
  }
}

export function blocklistFormFixture() {
  let blocklistData: BlockFormData
  let validationResult: ReturnType<typeof blocklistSchema.safeParse> | undefined

  return {
    given: {
      blocklistWithAllRequiredFields: () => {
        blocklistData = {
          name: 'Test',
          sirens: {
            android: [{ packageName: 'com.example' }],
            websites: [],
            keywords: [],
          },
        }
      },
      blocklistWithEmptyName: () => {
        blocklistData = {
          name: '',
          sirens: {
            android: [],
            websites: [],
            keywords: [],
          },
        }
      },
      blocklistWithNoSirensSelected: () => {
        blocklistData = {
          name: 'Test',
          sirens: {
            android: [],
            websites: [],
            keywords: [],
          },
        }
      },
      blocklistWithWebsitesAndKeywords: () => {
        blocklistData = buildValidBlocklistFormData({
          name: 'Social Block',
          sirens: {
            android: [],
            ios: [],
            linux: [],
            macos: [],
            windows: [],
            websites: ['facebook.com'],
            keywords: ['social'],
          },
        })
      },
    },
    when: {
      validate: () => {
        validationResult = blocklistSchema.safeParse(blocklistData)
        return validationResult
      },
    },
    then: {
      shouldBeValid: () => {
        expect(validationResult?.success).toBe(true)
      },
      shouldBeInvalidWithMessage: (path: string, message: string) => {
        expect(validationResult?.success).toBe(false)
        const error = validationResult?.success
          ? undefined
          : validationResult?.error.issues.find((i) => i.path[0] === path)
        expect(error?.message).toBe(message)
      },
    },
  }
}
