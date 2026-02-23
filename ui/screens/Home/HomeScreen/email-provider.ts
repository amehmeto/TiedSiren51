export type EmailProvider = {
  name: string
  iosDeepLink: string
  androidDeepLink: string
  webUrl: string
}

export function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? ''
}

function resolveEmailProviders(): Record<string, EmailProvider> {
  return {
    'gmail.com': {
      name: 'Gmail',
      iosDeepLink: 'googlegmail://',
      androidDeepLink: 'intent://#Intent;package=com.google.android.gm;end',
      webUrl: 'https://mail.google.com',
    },
    'googlemail.com': {
      name: 'Gmail',
      iosDeepLink: 'googlegmail://',
      androidDeepLink: 'intent://#Intent;package=com.google.android.gm;end',
      webUrl: 'https://mail.google.com',
    },
    'outlook.com': {
      name: 'Outlook',
      iosDeepLink: 'ms-outlook://',
      androidDeepLink:
        'intent://#Intent;package=com.microsoft.office.outlook;end',
      webUrl: 'https://outlook.live.com',
    },
    'hotmail.com': {
      name: 'Outlook',
      iosDeepLink: 'ms-outlook://',
      androidDeepLink:
        'intent://#Intent;package=com.microsoft.office.outlook;end',
      webUrl: 'https://outlook.live.com',
    },
    'live.com': {
      name: 'Outlook',
      iosDeepLink: 'ms-outlook://',
      androidDeepLink:
        'intent://#Intent;package=com.microsoft.office.outlook;end',
      webUrl: 'https://outlook.live.com',
    },
    'yahoo.com': {
      name: 'Yahoo Mail',
      iosDeepLink: 'ymail://',
      androidDeepLink:
        'intent://#Intent;package=com.yahoo.mobile.client.android.mail;end',
      webUrl: 'https://mail.yahoo.com',
    },
    'icloud.com': {
      name: 'Apple Mail',
      iosDeepLink: 'message://',
      androidDeepLink: '',
      webUrl: 'https://www.icloud.com/mail',
    },
    'me.com': {
      name: 'Apple Mail',
      iosDeepLink: 'message://',
      androidDeepLink: '',
      webUrl: 'https://www.icloud.com/mail',
    },
    'mac.com': {
      name: 'Apple Mail',
      iosDeepLink: 'message://',
      androidDeepLink: '',
      webUrl: 'https://www.icloud.com/mail',
    },
    'protonmail.com': {
      name: 'Proton Mail',
      iosDeepLink: 'protonmail://',
      androidDeepLink: 'intent://#Intent;package=ch.protonmail.android;end',
      webUrl: 'https://mail.proton.me',
    },
    'proton.me': {
      name: 'Proton Mail',
      iosDeepLink: 'protonmail://',
      androidDeepLink: 'intent://#Intent;package=ch.protonmail.android;end',
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
