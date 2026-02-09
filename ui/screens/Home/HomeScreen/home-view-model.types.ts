export type ViewModelBlockSession = {
  id: string
  name: string
  minutesLeft: string
  blocklists: number
  devices: number
}

export enum HomeViewModel {
  WithoutActiveNorScheduledSessions = 'WITHOUT_ACTIVE_NOR_SCHEDULED_SESSIONS',
  WithActiveWithoutScheduledSessions = 'WITH_ACTIVE_WITHOUT_SCHEDULED_SESSIONS',
  WithoutActiveWithScheduledSessions = 'WITHOUT_ACTIVE_WITH_SCHEDULED_SESSIONS',
  WithAllSessionTypes = 'WITH_ALL_SESSION_TYPES',
}

export enum Greetings {
  GoodMorning = 'Good Morning',
  GoodAfternoon = 'Good Afternoon',
  GoodEvening = 'Good Evening',
  GoodNight = 'Good Night',
}

export enum SessionBoardTitle {
  NO_ACTIVE_SESSIONS = 'NO ACTIVE SESSIONS',
  NO_SCHEDULED_SESSIONS = 'NO SCHEDULED SESSIONS',
  ACTIVE_SESSIONS = 'ACTIVE SESSIONS',
  SCHEDULED_SESSIONS = 'SCHEDULED SESSIONS',
}

export enum SessionBoardMessage {
  NO_ACTIVE_SESSIONS = "Starting a session allows you to quickly focus on a task at hand and do what's important to you.",
  NO_SCHEDULED_SESSIONS = 'Scheduled sessions start automatically and help you stay on track with your goals.',
}

export type WithoutActiveNorScheduledSessions = {
  type: HomeViewModel.WithoutActiveNorScheduledSessions
  greetings: Greetings
  activeSessions: {
    title: SessionBoardTitle.NO_ACTIVE_SESSIONS
    message: SessionBoardMessage.NO_ACTIVE_SESSIONS
  }
  scheduledSessions: {
    title: SessionBoardTitle.NO_SCHEDULED_SESSIONS
    message: SessionBoardMessage.NO_SCHEDULED_SESSIONS
  }
}

export type WithActiveWithoutScheduledSessions = {
  type: HomeViewModel.WithActiveWithoutScheduledSessions
  greetings: Greetings
  activeSessions: {
    title: SessionBoardTitle.ACTIVE_SESSIONS
    blockSessions: ViewModelBlockSession[]
  }
  scheduledSessions: {
    title: SessionBoardTitle.NO_SCHEDULED_SESSIONS
    message: SessionBoardMessage.NO_SCHEDULED_SESSIONS
  }
}

export type WithoutActiveWithScheduledSessions = {
  type: HomeViewModel.WithoutActiveWithScheduledSessions
  greetings: Greetings
  activeSessions: {
    title: SessionBoardTitle.NO_ACTIVE_SESSIONS
    message: SessionBoardMessage.NO_ACTIVE_SESSIONS
  }
  scheduledSessions: {
    title: SessionBoardTitle.SCHEDULED_SESSIONS
    blockSessions: ViewModelBlockSession[]
  }
}

export type WithAllSessionTypes = {
  type: HomeViewModel.WithAllSessionTypes
  greetings: Greetings
  activeSessions: {
    title: SessionBoardTitle.ACTIVE_SESSIONS
    blockSessions: ViewModelBlockSession[]
  }
  scheduledSessions: {
    title: SessionBoardTitle.SCHEDULED_SESSIONS
    blockSessions: ViewModelBlockSession[]
  }
}

export type HomeViewModelType =
  | WithoutActiveNorScheduledSessions
  | WithActiveWithoutScheduledSessions
  | WithoutActiveWithScheduledSessions
  | WithAllSessionTypes
