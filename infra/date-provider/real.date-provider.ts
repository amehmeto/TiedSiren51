import { DAY, MINUTE } from '@/core/__constants__/time'
import { DateProvider, ISODateString } from '@/core/_ports_/date-provider'

export class RealDateProvider implements DateProvider {
  getISOStringNow(): ISODateString {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Date.toISOString() always returns valid ISO format
    return new Date().toISOString() as ISODateString
  }

  getNow(): Date {
    return new Date()
  }

  getNowMs(): number {
    return Date.now()
  }

  getMinutesFromNow(minutes: number): Date {
    return new Date(new Date().getTime() + minutes * MINUTE)
  }

  getHHmmMinutesFromNow(minutes: number): string {
    return this.toHHmm(this.getMinutesFromNow(minutes))
  }

  recoverDate(timeInHHmm: string): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)

    const todayWithNewTime = new Date()
    todayWithNewTime.setHours(hours, minutes)

    return todayWithNewTime
  }

  recoverYesterdayDate(timeInHHmm: string): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)

    const today = new Date().getTime()
    const yesterdayWithNewTime = new Date(today - 1 * DAY)
    yesterdayWithNewTime.setHours(hours, minutes, 0, 0)

    return yesterdayWithNewTime
  }

  toHHmm(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  parseISOString(isoString: ISODateString): Date {
    return new Date(isoString)
  }

  toISOString(date: Date): ISODateString {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Date.toISOString() always returns valid ISO format
    return date.toISOString() as ISODateString
  }

  msToISOString(ms: number): ISODateString {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Date.toISOString() always returns valid ISO format
    return new Date(ms).toISOString() as ISODateString
  }
}
