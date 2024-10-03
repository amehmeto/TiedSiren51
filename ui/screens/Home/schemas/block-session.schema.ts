import { z } from 'zod'

function isEmptyString(val: string | null) {
  return val !== null && val.trim() !== ''
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
    }),
  endedAt: z
    .string()
    .nullable()
    .refine((val) => isEmptyString(val), {
      message: 'An end time must be provided',
    }),
  blockingCondition: z
    .string()
    .nullable()
    .refine((val) => isEmptyString(val), {
      message: 'A blocking condition must be selected',
    }),
})
