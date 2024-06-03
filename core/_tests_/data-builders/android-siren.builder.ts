import { AndroidSiren } from '../../siren/sirens'
import { AmazonPrimeIcon } from '@/assets/base64AppIcon/amazonPrimeAppIcon'
import { faker } from '@faker-js/faker'
import { TikTokAppIcon } from '@/assets/base64AppIcon/tikTokAppIcon'
import { YouTubeAppIcon } from '@/assets/base64AppIcon/youTubeAppIcon'
import { InstagramAppIcon } from '@/assets/base64AppIcon/instagramAppIcon'
import { FacebookAppIcon } from '@/assets/base64AppIcon/facebookAppIcon'
import { WhatsAppAppIcon } from '@/assets/base64AppIcon/whatsAppAppIcon'

export function buildAndroidSiren(
  wantedAndroidSiren: Partial<AndroidSiren> = {},
): AndroidSiren {
  const androidSirens = [
    {
      packageName: 'com.example.instagram',
      appName: 'Instagram',
      icon: InstagramAppIcon,
    },
    {
      packageName: 'com.facebook.katana',
      appName: 'Facebook',
      icon: FacebookAppIcon,
    },
    {
      packageName: 'com.example.tiktok',
      appName: 'TikTok',
      icon: TikTokAppIcon,
    },
    {
      packageName: 'com.example.youtube',
      appName: 'YouTube',
      icon: YouTubeAppIcon,
    },
    {
      packageName: 'com.example.amazonprime',
      appName: 'Amazon Prime',
      icon: AmazonPrimeIcon,
    },
    {
      packageName: 'com.whatsapp',
      appName: 'WhatsApp',
      icon: WhatsAppAppIcon,
    },
  ]
  const randomAndroidSiren: AndroidSiren =
    faker.helpers.arrayElement(androidSirens)

  return { ...randomAndroidSiren, ...wantedAndroidSiren }
}

export const instagramAndroidSiren = buildAndroidSiren({
  packageName: 'com.example.instagram',
  appName: 'Instagram',
  icon: InstagramAppIcon,
})

export const facebookAndroidSiren = buildAndroidSiren({
  packageName: 'com.facebook.katana',
  appName: 'Facebook',
  icon: FacebookAppIcon,
})

export const tikTokAndroidSiren = buildAndroidSiren({
  packageName: 'com.example.tiktok',
  appName: 'TikTok',
  icon: TikTokAppIcon,
})

export const youtubeAndroidSiren = buildAndroidSiren({
  packageName: 'com.example.youtube',
  appName: 'YouTube',
  icon: YouTubeAppIcon,
})

export const amazonPrimeAndroidSiren = buildAndroidSiren({
  packageName: 'com.example.amazonprime',
  appName: 'Amazon Prime',
  icon: AmazonPrimeIcon,
})

export const whatsappAndroidSiren = buildAndroidSiren({
  packageName: 'com.whatsapp',
  appName: 'WhatsApp',
  icon: WhatsAppAppIcon,
})
