import { expect } from 'vitest'
import { z } from 'zod'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { Fixture } from '@/core/_tests_/fixture.type'
import { blocklistSchema } from './blocklist-form.schema'

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

export function blocklistFormFixture(): Fixture {
  let blocklistData: BlockFormData
  let validationResult: ReturnType<typeof blocklistSchema.safeParse> | undefined

  return {
    given: {
      blocklistWithAllRequiredFields: () => {
        blocklistData = buildValidBlocklistFormData({
          name: 'Test',
          sirens: {
            android: [
              {
                packageName: 'com.example',
                appName: 'Example',
                icon: 'base64',
              },
            ],
            websites: [],
            keywords: [],
          },
        })
      },
      blocklistWithEmptyName: () => {
        blocklistData = buildValidBlocklistFormData({
          name: '',
          sirens: { android: [], websites: [], keywords: [] },
        })
      },
      blocklistWithNoSirensSelected: () => {
        blocklistData = buildValidBlocklistFormData({
          name: 'Test',
          sirens: { android: [], websites: [], keywords: [] },
        })
      },
      blocklistWithWebsitesAndKeywords: () => {
        blocklistData = buildValidBlocklistFormData({
          name: 'Social Block',
          sirens: {
            android: [],
            websites: ['facebook.com'],
            keywords: ['social'],
          },
        })
      },
      blocklistWithOnlyWebsites: () => {
        blocklistData = buildValidBlocklistFormData({
          name: 'Websites Only',
          sirens: { android: [], websites: ['facebook.com'], keywords: [] },
        })
      },
      blocklistWithOnlyKeywords: () => {
        blocklistData = buildValidBlocklistFormData({
          name: 'Keywords Only',
          sirens: { android: [], websites: [], keywords: ['social'] },
        })
      },
      blocklistWithOnlyAndroidAppsAndUndefinedSirens: () => {
        blocklistData = {
          name: 'Test',
          sirens: { android: [{ packageName: 'com.test' }] },
        }
      },
      blocklistWithEmptySirensObject: () => {
        blocklistData = {
          name: 'Test',
          sirens: {},
        }
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
      shouldBeInvalid: () => {
        expect(validationResult?.success).toBe(false)
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
