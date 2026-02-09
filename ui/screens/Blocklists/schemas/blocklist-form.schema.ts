import { z } from 'zod'

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
    .refine(
      (sirens) => {
        const hasSelectedApps = (sirens.android?.length ?? 0) > 0
        const hasSelectedWebsites = (sirens.websites?.length ?? 0) > 0
        const hasSelectedKeywords = (sirens.keywords?.length ?? 0) > 0

        return hasSelectedApps || hasSelectedWebsites || hasSelectedKeywords
      },
      {
        message:
          'You must select at least one of: Apps, Websites, or Keywords.',
      },
    ),
})
