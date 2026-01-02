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
    const result = new Date().toISOString()
    assertISODateString(result)
    return result
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
    const result = `${hours}:${minutes}`
    assertHHmmString(result)
    return result
  }

  parseISOString(isoString: ISODateString): Date {
    return new Date(isoString)
  }

  toISOString(date: Date): ISODateString {
    const result = date.toISOString()
    assertISODateString(result)
    return result
  }

  msToISOString(ms: number): ISODateString {
    const result = new Date(ms).toISOString()
    assertISODateString(result)
    return result
  }
}
