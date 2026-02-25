export type EmailProvider = {
  name: string
  deepLink: string
  webUrl: string
}

export function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? ''
}

function resolveEmailProviders(): Record<string, EmailProvider> {
  return {
    'gmail.com': {
      name: 'Gmail',
      deepLink: 'googlegmail://',
      webUrl: 'https://mail.google.com',
    },
    'googlemail.com': {
      name: 'Gmail',
      deepLink: 'googlegmail://',
      webUrl: 'https://mail.google.com',
    },
    'outlook.com': {
      name: 'Outlook',
      deepLink: 'ms-outlook://',
      webUrl: 'https://outlook.live.com',
    },
    'hotmail.com': {
      name: 'Outlook',
      deepLink: 'ms-outlook://',
      webUrl: 'https://outlook.live.com',
    },
    'live.com': {
      name: 'Outlook',
      deepLink: 'ms-outlook://',
      webUrl: 'https://outlook.live.com',
    },
    'yahoo.com': {
      name: 'Yahoo Mail',
      deepLink: 'ymail://',
      webUrl: 'https://mail.yahoo.com',
    },
    'icloud.com': {
      name: 'Apple Mail',
      deepLink: 'message://',
      webUrl: 'https://www.icloud.com/mail',
    },
    'me.com': {
      name: 'Apple Mail',
      deepLink: 'message://',
      webUrl: 'https://www.icloud.com/mail',
    },
    'mac.com': {
      name: 'Apple Mail',
      deepLink: 'message://',
      webUrl: 'https://www.icloud.com/mail',
    },
    'protonmail.com': {
      name: 'Proton Mail',
      deepLink: 'protonmail://',
      webUrl: 'https://mail.proton.me',
    },
    'proton.me': {
      name: 'Proton Mail',
      deepLink: 'protonmail://',
      webUrl: 'https://mail.proton.me',
    },
  }
}

export function getEmailProvider(email: string): EmailProvider | null {
  const domain = extractDomain(email)
  return resolveEmailProviders()[domain] ?? null
}

export function getOpenEmailLabel(email: string): string {
  const provider = getEmailProvider(email)
  return provider ? `Open ${provider.name}` : 'Open your email app'
}

export function getWebUrl(email: string): string | null {
  const provider = getEmailProvider(email)
  return provider?.webUrl ?? null
}
