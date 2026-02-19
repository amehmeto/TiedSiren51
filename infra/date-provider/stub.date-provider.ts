import { DAY, MINUTE } from '@/core/__constants__/time'
import {
  assertHHmmString,
  assertISODateString,
  DateProvider,
  HHmmString,
  ISODateString,
} from '@/core/_ports_/date-provider'

export class StubDateProvider implements DateProvider {
  now = new Date()

  getNow(): Date {
    return this.now
  }

  getNowMs(): number {
    return this.now.getTime()
  }

  getISOStringNow(): ISODateString {
    const isoString = this.now.toISOString()
    assertISODateString(isoString)
    return isoString
  }

  getHHmmNow(): HHmmString {
    return this.toHHmm(this.now)
  }

  recoverDate(timeInHHmm: HHmmString): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)

    const todayWithNewTime = new Date(this.now.getTime())
    todayWithNewTime.setHours(hours, minutes, 0, 0)

    return todayWithNewTime
  }

  toHHmm(date: Date): HHmmString {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const hhmmString = `${hours}:${minutes}`
    assertHHmmString(hhmmString)
    return hhmmString
  }

  to12HourTime(date: Date): string {
    const hour = date.getHours()
    const minute = date.getMinutes()
    const hour12 = hour % 12 || 12
    const minuteFormatted = String(minute).padStart(2, '0')
    const period = hour >= 12 ? 'p.m.' : 'a.m.'
    return `${hour12}:${minuteFormatted} ${period}`
  }

  recoverYesterdayDate(timeInHHmm: HHmmString): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)

    const todayWithNewTime = new Date(this.now.getTime() - 1 * DAY)
    todayWithNewTime.setHours(hours, minutes, 0, 0)

    return todayWithNewTime
  }

  getHHmmMinutesFromNow(minutes: number): HHmmString {
    return this.toHHmm(this.getMinutesFromNow(minutes))
  }

  getMinutesFromNow(minutes: number): Date {
    return new Date(this.now.getTime() + minutes * MINUTE)
  }

  parseISOString(isoString: ISODateString): Date {
    return new Date(isoString)
  }

  toISOString(date: Date): ISODateString {
    const isoString = date.toISOString()
    assertISODateString(isoString)
    return isoString
  }

  msToISOString(ms: number): ISODateString {
    const isoString = new Date(ms).toISOString()
    assertISODateString(isoString)
    return isoString
  }
}
