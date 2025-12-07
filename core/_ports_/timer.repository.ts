import { ISODateString } from './port.date-provider'

export interface TimerRepository {
  saveTimer(userId: string, endedAt: ISODateString): Promise<void>
  loadTimer(userId: string): Promise<ISODateString | null>
}
