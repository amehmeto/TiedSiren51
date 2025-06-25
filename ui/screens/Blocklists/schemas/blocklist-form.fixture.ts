import { blocklistSchema } from './blocklist-form.schema'
import { expect } from 'vitest'
import { z } from 'zod'

export type Blocklist = z.infer<typeof blocklistSchema>

export class BlocklistBuilder {
  private blocklist: Blocklist = {
    name: '',
    sirens: {
      android: [],
      websites: [],
      keywords: [],
    },
  }

  withName(name: string): BlocklistBuilder {
    this.blocklist.name = name
    return this
  }

  withAndroidApps(apps: { packageName: string }[]): BlocklistBuilder {
    this.blocklist.sirens.android = apps
    return this
  }

  withWebsites(websites: string[]): BlocklistBuilder {
    this.blocklist.sirens.websites = websites
    return this
  }

  withKeywords(keywords: string[]): BlocklistBuilder {
    this.blocklist.sirens.keywords = keywords
    return this
  }

  build(): Blocklist {
    return { ...this.blocklist }
  }
}

export function createValidBlocklist(): Blocklist {
  return new BlocklistBuilder()
    .withName('Test Blocklist')
    .withAndroidApps([{ packageName: 'com.example.app' }])
    .withWebsites([])
    .withKeywords([])
    .build()
}

export function blocklistFormFixture() {
  let blocklistData: Blocklist = {
    name: 'Test Blocklist',
    sirens: {
      android: [{ packageName: 'com.example.app' }],
      websites: [],
      keywords: [],
    },
  }
  let validationResult: ReturnType<typeof blocklistSchema.safeParse> | undefined

  return {
    given: {
      withName(name: string) {
        blocklistData = { ...blocklistData, name }
      },
      withEmptyName() {
        blocklistData = { ...blocklistData, name: '' }
      },
      sirens(sirens: Blocklist['sirens']) {
        blocklistData = { ...blocklistData, sirens }
      },
    },
    when: {
      validate() {
        validationResult = blocklistSchema.safeParse(blocklistData)
        return validationResult
      },
    },
    then: {
      shouldBeValid() {
        expect(validationResult).toBeDefined()
        expect(validationResult?.success).toBe(true)
      },
      shouldBeInvalidWithMessage(path: string, message: string) {
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
