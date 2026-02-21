import { expect } from 'vitest'
import { z } from 'zod'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { Fixture } from '@/core/_tests_/fixture.type'
import { DEFAULT_FEATURE_FLAGS, FeatureFlagValues } from '@/feature-flags'
import { blocklistFormSchema } from './blocklist-form.schema'

type BlocklistSchema = ReturnType<typeof blocklistFormSchema>
export type BlockFormData = z.infer<BlocklistSchema>

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

export function blocklistFormFixture(
  flags: FeatureFlagValues = DEFAULT_FEATURE_FLAGS,
): Fixture {
  let blocklistData: BlockFormData
  let validationResult: ReturnType<BlocklistSchema['safeParse']> | undefined

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
        blocklistData = {
          name: 'Websites Only',
          sirens: {
            android: [],
            websites: ['facebook.com'],
            keywords: [],
          },
        }
      },
      blocklistWithOnlyKeywords: () => {
        blocklistData = {
          name: 'Keywords Only',
          sirens: {
            android: [],
            websites: [],
            keywords: ['social'],
          },
        }
      },
      blocklistWithUndefinedSirenFields: () => {
        blocklistData = {
          name: 'Undefined Fields',
          sirens: {
            android: [{ packageName: 'com.example' }],
          },
        }
      },
      blocklistWithUndefinedAndroid: () => {
        blocklistData = {
          name: 'No Android',
          sirens: {
            websites: ['facebook.com'],
          },
        }
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
        validationResult = blocklistFormSchema(flags).safeParse(blocklistData)
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
