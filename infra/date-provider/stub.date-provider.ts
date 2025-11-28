import { DAY, MINUTE } from '@/core/__constants__/time'
import { DateProvider } from '@/core/_ports_/port.date-provider'

export class StubDateProvider implements DateProvider {
  now = new Date()

  getNow(): Date {
    return this.now
  }

  getNowMs(): number {
    return this.now.getTime()
  }

  getISOStringNow(): string {
    return this.now.toISOString()
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
