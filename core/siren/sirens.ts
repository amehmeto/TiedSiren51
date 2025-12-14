import { InstalledApp } from '../installed-app/installed-app'

export enum SirenType {
  WEBSITES = 'websites',
  KEYWORDS = 'keywords',
  ANDROID = 'android',
  WINDOWS = 'windows',
  MACOS = 'macos',
  IOS = 'ios',
  LINUX = 'linux',
}

export type AndroidSiren = Pick<
  InstalledApp,
  'packageName' | 'appName' | 'icon'
>

export type Sirens = {
  android: AndroidSiren[]
  windows: string[]
  macos: string[]
  ios: string[]
  linux: string[]
  websites: string[]
  keywords: string[]
}
