import { expect } from 'vitest'
import { z } from 'zod'
import { blocklistSchema } from './blocklist-form.schema'
import { buildBlocklist } from '../../../../core/_tests_/data-builders/blocklist.builder'

export type Blocklist = z.infer<typeof blocklistSchema>

function convertToForm(
  blocklistConfig: Parameters<typeof buildBlocklist>[0] = {},
): Blocklist {
  const domainBlocklist = buildBlocklist(blocklistConfig)

  return {
    name: domainBlocklist.name,
    sirens: {
      android: domainBlocklist.sirens.android,
      websites: domainBlocklist.sirens.websites,
      keywords: domainBlocklist.sirens.keywords,
    },
  }
}

export function blocklistFormFixture() {
  let blocklistData: Blocklist = convertToForm()
  let validationResult: ReturnType<typeof blocklistSchema.safeParse> | undefined

  return {
    given: {
      withOverrides: (overrides: Partial<Blocklist>) => {
        blocklistData = { ...convertToForm(), ...overrides }
      },
      fromConfig: (
        blocklistConfig: Parameters<typeof buildBlocklist>[0] = {},
      ) => {
        blocklistData = convertToForm(blocklistConfig)
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
