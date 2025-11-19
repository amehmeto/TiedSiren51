import { DateProvider } from '@/core/_ports_/port.date-provider'

export class RealDateProvider implements DateProvider {
  private MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000

  getISOStringNow(): string {
    return new Date().toISOString()
  }

  getNow(): Date {
    return new Date()
  }

  getMinutesFromNow(minutes: number): Date {
    return new Date(new Date().getTime() + minutes * 60 * 1000)
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
    const yesterdayWithNewTime = new Date(today - this.MILLISECONDS_IN_A_DAY)
    yesterdayWithNewTime.setHours(hours, minutes, 0, 0)

    return yesterdayWithNewTime
  }

  toHHmm(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }
}
