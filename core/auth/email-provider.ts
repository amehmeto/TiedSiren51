export type EmailProvider = {
  name: string
  deepLink: string
  webUrl: string
}

export function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? ''
}

function resolveEmailProviders(): Record<string, EmailProvider> {
  const gmail: EmailProvider = {
    name: 'Gmail',
    deepLink: 'googlegmail://',
    webUrl: 'https://mail.google.com',
  }
  const outlook: EmailProvider = {
    name: 'Outlook',
    deepLink: 'ms-outlook://',
    webUrl: 'https://outlook.live.com',
  }
  const yahooMail: EmailProvider = {
    name: 'Yahoo Mail',
    deepLink: 'ymail://',
    webUrl: 'https://mail.yahoo.com',
  }
  const appleMail: EmailProvider = {
    name: 'Apple Mail',
    deepLink: 'message://',
    webUrl: 'https://www.icloud.com/mail',
  }
  const protonMail: EmailProvider = {
    name: 'Proton Mail',
    deepLink: 'protonmail://',
    webUrl: 'https://mail.proton.me',
  }

  return {
    'gmail.com': gmail,
    'googlemail.com': gmail,
    'outlook.com': outlook,
    'hotmail.com': outlook,
    'live.com': outlook,
    'yahoo.com': yahooMail,
    'icloud.com': appleMail,
    'me.com': appleMail,
    'mac.com': appleMail,
    'protonmail.com': protonMail,
    'proton.me': protonMail,
  }
}

export function getEmailProvider(email: string): EmailProvider | null {
  const domain = extractDomain(email)
  return resolveEmailProviders()[domain] ?? null
}

export function getOpenEmailLabel(email: string): string | null {
  const provider = getEmailProvider(email)
  return provider ? `Open ${provider.name}` : null
}

export function getWebUrl(email: string): string | null {
  const provider = getEmailProvider(email)
  return provider?.webUrl ?? null
}
