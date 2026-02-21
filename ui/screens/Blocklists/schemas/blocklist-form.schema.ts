import { z } from 'zod'
import { FeatureFlagValues } from '@/feature-flags'

function getEnabledSirenTypeLabels(flags: FeatureFlagValues): string[] {
  return [
    'Apps',
    ...(flags.WEBSITE_BLOCKING ? ['Websites'] : []),
    ...(flags.KEYWORD_BLOCKING ? ['Keywords'] : []),
  ]
}

export const blocklistFormSchema = (flags: FeatureFlagValues) => {
  return z.object({
    name: z.string().refine((val) => val.trim() !== '', {
      message: 'Blocklist name must be provided',
    }),
    sirens: z
      .object({
        android: z.array(z.any()).optional(),
        websites: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
      })
      .superRefine(({ android, websites, keywords }, ctx) => {
        const hasSelectedApps = (android?.length ?? 0) > 0
        const hasSelectedWebsites =
          flags.WEBSITE_BLOCKING && (websites?.length ?? 0) > 0
        const hasSelectedKeywords =
          flags.KEYWORD_BLOCKING && (keywords?.length ?? 0) > 0

        if (!hasSelectedApps && !hasSelectedWebsites && !hasSelectedKeywords) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `You must select at least one of: ${getEnabledSirenTypeLabels(flags).join(', ')}.`,
          })
        }
      }),
  })
}
