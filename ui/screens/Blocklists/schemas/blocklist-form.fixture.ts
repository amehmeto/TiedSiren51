import { blocklistSchema } from './blocklist-form.schema'
import { expect } from 'vitest'
import { z } from 'zod'

export type Blocklist = z.infer<typeof blocklistSchema>

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
      field<K extends keyof Blocklist>(field: K, value: Blocklist[K]) {
        blocklistData = { ...blocklistData, [field]: value }
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
