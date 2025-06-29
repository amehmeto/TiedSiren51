import { blocklistSchema } from './blocklist-form.schema'
import { expect } from 'vitest'
import { z } from 'zod'
import { buildBlocklist } from '../../../../core/_tests_/data-builders/blocklist.builder'
import { buildAndroidSiren } from '../../../../core/_tests_/data-builders/android-siren.builder'

export type Blocklist = z.infer<typeof blocklistSchema>

export function buildBlocklistForm(
  overrides: Partial<Blocklist> = {},
): Blocklist {
  const domainBlocklist = buildBlocklist()

  const defaultFormData: Blocklist = {
    name: domainBlocklist.name,
    sirens: {
      android: domainBlocklist.sirens.android,
      websites: domainBlocklist.sirens.websites,
      keywords: domainBlocklist.sirens.keywords,
    },
  }

  return { ...defaultFormData, ...overrides }
}

export function convertDomainToForm(
  domainOverrides: Parameters<typeof buildBlocklist>[0] = {},
): Blocklist {
  const domainBlocklist = buildBlocklist(domainOverrides)

  return {
    name: domainBlocklist.name,
    sirens: {
      android: domainBlocklist.sirens.android,
      websites: domainBlocklist.sirens.websites,
      keywords: domainBlocklist.sirens.keywords,
    },
  }
}

export const createValidBlocklist = (): Blocklist =>
  buildBlocklistForm({
    name: 'Test Blocklist',
    sirens: {
      android: [{ packageName: 'com.example.app' }],
      websites: [],
      keywords: [],
    },
  })

export const createEmptyForm = (): Blocklist =>
  buildBlocklistForm({
    name: '',
    sirens: {
      android: [],
      websites: [],
      keywords: [],
    },
  })

export const createFormWithWebsites = (websites: string[]): Blocklist =>
  buildBlocklistForm({
    sirens: {
      android: [],
      websites,
      keywords: [],
    },
  })

export const createFormWithKeywords = (keywords: string[]): Blocklist =>
  buildBlocklistForm({
    sirens: {
      android: [],
      websites: [],
      keywords,
    },
  })

export const createFormWithAndroid = (
  apps: { packageName: string }[],
): Blocklist =>
  buildBlocklistForm({
    sirens: {
      android: apps,
      websites: [],
      keywords: [],
    },
  })

export const createSocialMediaForm = (): Blocklist =>
  convertDomainToForm({
    name: 'Social Media Block',
    sirens: {
      android: [buildAndroidSiren({ packageName: 'com.instagram.android' })],
      ios: [],
      linux: [],
      macos: [],
      windows: [],
      websites: ['instagram.com', 'facebook.com', 'twitter.com'],
      keywords: ['social', 'media'],
    },
  })

export const createWorkForm = (): Blocklist =>
  convertDomainToForm({
    name: 'Work Block',
    sirens: {
      android: [buildAndroidSiren({ packageName: 'com.slack' })],
      ios: [],
      linux: [],
      macos: [],
      windows: [],
      websites: ['slack.com'],
      keywords: ['work'],
    },
  })

export function blocklistFormFixture() {
  let blocklistData: Blocklist = createValidBlocklist()
  let validationResult: ReturnType<typeof blocklistSchema.safeParse> | undefined

  return {
    given: {
      validForm: () => {
        blocklistData = createValidBlocklist()
      },
      emptyForm: () => {
        blocklistData = createEmptyForm()
      },
      withName: (name: string) => {
        blocklistData = buildBlocklistForm({ name })
      },
      withEmptyName: () => {
        blocklistData = buildBlocklistForm({ name: '' })
      },
      sirens: (sirens: Blocklist['sirens']) => {
        blocklistData = buildBlocklistForm({ sirens })
      },
      formWithWebsites: (websites: string[]) => {
        blocklistData = createFormWithWebsites(websites)
      },
      formWithKeywords: (keywords: string[]) => {
        blocklistData = createFormWithKeywords(keywords)
      },
      formWithAndroid: (apps: { packageName: string }[]) => {
        blocklistData = createFormWithAndroid(apps)
      },
      socialMediaForm: () => {
        blocklistData = createSocialMediaForm()
      },
      workForm: () => {
        blocklistData = createWorkForm()
      },
      fromDomain: (
        domainOverrides: Parameters<typeof buildBlocklist>[0] = {},
      ) => {
        blocklistData = convertDomainToForm(domainOverrides)
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
        expect(validationResult).toBeDefined()
        expect(validationResult?.success).toBe(true)
      },
      shouldBeInvalidWithMessage: (path: string, message: string) => {
        expect(validationResult).toBeDefined()
        expect(validationResult?.success).toBe(false)
        if (validationResult && !validationResult.success) {
          const error = validationResult.error.issues.find(
            (issue) => issue.path[0] === path,
          )
          expect(error).toBeDefined()
          expect(error?.message).toBe(message)
        }
      },
    },
  }
}
