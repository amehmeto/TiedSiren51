import { faker } from '@faker-js/faker'
import { AmazonPrimeIcon } from '@/assets/base64AppIcon/amazonPrimeAppIcon'
import { FacebookAppIcon } from '@/assets/base64AppIcon/facebookAppIcon'
import { InstagramAppIcon } from '@/assets/base64AppIcon/instagramAppIcon'
import { TikTokAppIcon } from '@/assets/base64AppIcon/tikTokAppIcon'
import { WhatsAppAppIcon } from '@/assets/base64AppIcon/whatsAppAppIcon'
import { YouTubeAppIcon } from '@/assets/base64AppIcon/youTubeAppIcon'
import { InstalledAppRepository } from '@/core/_ports_/installed-app.repository'
import { InstalledApp } from '@/core/installed-app/installed-app'

export function buildInstalledApp(
  wantedInstalledApp: Partial<InstalledApp>,
): InstalledApp {
  const randomIcon = faker.helpers.arrayElement([
    `data:image/png;base64,${AmazonPrimeIcon}`,
    `data:image/png;base64,${TikTokAppIcon}`,
    `data:image/png;base64,${YouTubeAppIcon}`,
  ])

  const randomInstalledApp = {
    packageName: faker.internet.domainName(),
    versionName: faker.system.semver(),
    versionCode: faker.number.int(),
    firstInstallTime: faker.date.anytime().getTime(),
    lastUpdateTime: faker.date.anytime().getTime(),
    appName: faker.commerce.productName(),
    icon: randomIcon,
    apkDir: `/data/app/${faker.system.fileName()}`,
    size: faker.number.int(),
  }
  return { ...randomInstalledApp, ...wantedInstalledApp }
}
export class FakeDataInstalledAppsRepository implements InstalledAppRepository {
  installedApps = new Map<string, InstalledApp>([
    [
      'com.example.youtube',
      {
        packageName: 'com.example.youtube',
        versionName: '1.0.0',
        versionCode: 1,
        firstInstallTime: 1616161616161,
        lastUpdateTime: 1626262626262,
        appName: 'YouTube',
        icon: `data:image/png;base64,${YouTubeAppIcon}`,
        apkDir: '/data/app/youtube-1/base.apk',
        size: 52428800,
      },
    ],
    [
      'com.example.amazonprime',
      {
        packageName: 'com.example.amazonprime',
        versionName: '1.0.0',
        versionCode: 1,
        firstInstallTime: 1616161616161,
        lastUpdateTime: 1626262626262,
        appName: 'Amazon Prime',
        icon: `data:image/png;base64,${AmazonPrimeIcon}`,
        apkDir: '/data/app/amazonprime-1/base.apk',
        size: 52428800,
      },
    ],
    [
      'com.example.tiktok',
      {
        packageName: 'com.example.tiktok',
        versionName: '1.0.0',
        versionCode: 1,
        firstInstallTime: 1616161616161,
        lastUpdateTime: 1626262626262,
        appName: 'TikTok',
        icon: `data:image/png;base64,${TikTokAppIcon}`,
        apkDir: '/data/app/tiktok-1/base.apk',
        size: 52428800,
      },
    ],
    [
      'com.example.facebook',
      {
        packageName: 'com.example.facebook',
        versionName: '1.0.0',
        versionCode: 1,
        firstInstallTime: 1616161616161,
        lastUpdateTime: 1626262626262,
        appName: 'Facebook',
        icon: `data:image/png;base64,${FacebookAppIcon}`,
        apkDir: '/data/app/facebook/base.apk',
        size: 52428800,
      },
    ],
    [
      'com.example.instagram',
      {
        packageName: 'com.example.instagram',
        versionName: '1.0.0',
        versionCode: 1,
        firstInstallTime: 1616161616161,
        lastUpdateTime: 1626262626262,
        appName: 'Instagram',
        icon: `data:image/png;base64,${InstagramAppIcon}`,
        apkDir: '/data/app/instagram-1/base.apk',
        size: 52428800,
      },
    ],
    [
      'com.example.whatsapp-1',
      {
        packageName: 'com.example.whatsapp-1',
        versionName: '1.0.0',
        versionCode: 1,
        firstInstallTime: 1616161616161,
        lastUpdateTime: 1626262626262,
        appName: 'WhatsApp',
        icon: `data:image/png;base64,${WhatsAppAppIcon}`,
        apkDir: '/data/app/whatsApp-1/base.apk',
        size: 52428800,
      },
    ],
  ])

  getInstalledApps(): Promise<InstalledApp[]> {
    return Promise.resolve(Array.from(this.installedApps.values()))
  }
}
