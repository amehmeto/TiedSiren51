import { z } from 'zod'
import { FeatureFlags } from '@/feature-flags'

function getEnabledSirenTypeLabels(): string[] {
  return [
    'Apps',
    ...(FeatureFlags.WEBSITE_BLOCKING ? ['Websites'] : []),
    ...(FeatureFlags.KEYWORD_BLOCKING ? ['Keywords'] : []),
  ]
}

export const blocklistFormSchema = z.object({
  name: z.string().refine((val) => val.trim() !== '', {
    message: 'Blocklist name must be provided',
  }),
  sirens: z
    .object({
      // android: z.array(
      //   z.object({
      //     packageName: z.string(),
      //   }),
      // ),
      // ios: z.array(z.string()),
      // windows: z.array(z.string()),
      // macos: z.array(z.string()),
      // linux: z.array(z.string()),
      android: z.array(z.any()).optional(),
      websites: z.array(z.string()).optional(),
      keywords: z.array(z.string()).optional(),
    })
    .superRefine(({ android, websites, keywords }, ctx) => {
      const hasSelectedApps = (android?.length ?? 0) > 0
      const hasSelectedWebsites =
        FeatureFlags.WEBSITE_BLOCKING && (websites?.length ?? 0) > 0
      const hasSelectedKeywords =
        FeatureFlags.KEYWORD_BLOCKING && (keywords?.length ?? 0) > 0

      if (!hasSelectedApps && !hasSelectedWebsites && !hasSelectedKeywords) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `You must select at least one of: ${getEnabledSirenTypeLabels().join(', ')}.`,
        })
      }
    }),
})
