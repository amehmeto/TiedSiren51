import { DAY, MINUTE } from '@/core/__constants__/time'
import { DateProvider, ISODateString } from '@/core/_ports_/date-provider'

export class StubDateProvider implements DateProvider {
  now = new Date()

  getNow(): Date {
    return this.now
  }

  getNowMs(): number {
    return this.now.getTime()
  }

  getISOStringNow(): ISODateString {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Date.toISOString() always returns valid ISO format
    return this.now.toISOString() as ISODateString
  }

  recoverDate(timeInHHmm: string): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)

    const todayWithNewTime = new Date(this.now.getTime())
    todayWithNewTime.setHours(hours, minutes, 0, 0)

    return todayWithNewTime
  }

  toHHmm(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  recoverYesterdayDate(timeInHHmm: string): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)

    const todayWithNewTime = new Date(this.now.getTime() - 1 * DAY)
    todayWithNewTime.setHours(hours, minutes, 0, 0)

    return todayWithNewTime
  }

  getHHmmMinutesFromNow(minutes: number): string {
    return this.toHHmm(this.getMinutesFromNow(minutes))
  }

  getMinutesFromNow(minutes: number): Date {
    return new Date(this.now.getTime() + minutes * MINUTE)
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
