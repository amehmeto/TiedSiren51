import { ISODateString } from './port.date-provider'

export interface TimerRepository {
  saveTimer(userId: string, endAt: ISODateString): Promise<void>
  loadTimer(userId: string): Promise<ISODateString | null>
}
