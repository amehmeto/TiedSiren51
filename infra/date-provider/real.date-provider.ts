import { DAY, MINUTE } from '@/core/__constants__/time'
import { DateProvider } from '@/core/_ports_/port.date-provider'

export class RealDateProvider implements DateProvider {
  getISOStringNow(): string {
    return new Date().toISOString()
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

  parseISOString(isoString: string): Date {
    return new Date(isoString)
  }

  toISOString(date: Date): string {
    return date.toISOString()
  }

  msToISOString(ms: number): string {
    return new Date(ms).toISOString()
  }
}
