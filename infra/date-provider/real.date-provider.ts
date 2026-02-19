import { DAY, MINUTE } from '@/core/__constants__/time'
import {
  assertHHmmString,
  assertISODateString,
  DateProvider,
  HHmmString,
  ISODateString,
} from '@/core/_ports_/date-provider'

export class RealDateProvider implements DateProvider {
  getISOStringNow(): ISODateString {
    const isoString = new Date().toISOString()
    assertISODateString(isoString)
    return isoString
  }

  getNow(): Date {
    return new Date()
  }

  getNowMs(): number {
    return Date.now()
  }

  getHHmmNow(): HHmmString {
    return this.toHHmm(this.getNow())
  }

  getMinutesFromNow(minutes: number): Date {
    return new Date(new Date().getTime() + minutes * MINUTE)
  }

  getHHmmMinutesFromNow(minutes: number): HHmmString {
    return this.toHHmm(this.getMinutesFromNow(minutes))
  }

  recoverDate(timeInHHmm: HHmmString): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)

    const todayWithNewTime = new Date()
    todayWithNewTime.setHours(hours, minutes)

    return todayWithNewTime
  }

  recoverYesterdayDate(timeInHHmm: HHmmString): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)

    const today = new Date().getTime()
    const yesterdayWithNewTime = new Date(today - 1 * DAY)
    yesterdayWithNewTime.setHours(hours, minutes, 0, 0)

    return yesterdayWithNewTime
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
