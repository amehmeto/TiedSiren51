import { z } from 'zod'
import { isEmptyString } from './is-empty-string'

function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

export const blockSessionSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .nullable()
    .refine((val) => isEmptyString(val), {
      message: 'A session name must be provided',
    }),
  blocklists: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .min(1, { message: 'At least one blocklist must be selected' }),
  devices: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .min(1, { message: 'At least one device must be selected' }),
  startedAt: z
    .string()
    .nullable()
    .refine((val) => isEmptyString(val), {
      message: 'A start time must be provided',
    })
    .refine((val) => val === null || isValidTimeFormat(val), {
      message: 'Start time must be in HH:mm format (e.g. 07:00)',
    }),
  endedAt: z
    .string()
    .nullable()
    .refine((val) => isEmptyString(val), {
      message: 'An end time must be provided',
    })
    .refine((val) => val === null || isValidTimeFormat(val), {
      message: 'End time must be in HH:mm format (e.g. 07:00)',
    }),
  blockingConditions: z
    .array(z.string())
    .min(1, { message: 'A blocking condition must be selected' }),
})
