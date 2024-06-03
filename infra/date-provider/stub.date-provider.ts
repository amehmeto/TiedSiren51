import { DateProvider } from '@/core/ports/port.date-provider'

export class StubDateProvider implements DateProvider {
  private MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000
  now = new Date()

  getNow(): Date {
    return this.now
  }

  getISOStringNow(): string {
    return this.now.toISOString()
  }

  recoverDate(timeInHHmm: string): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)

    const todayWithNewTime = new Date(this.now.getTime())
    todayWithNewTime.setUTCHours(hours, minutes, 0, 0)

    return todayWithNewTime
  }

  toHHmm(date: Date): string {
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  recoverYesterdayDate(timeInHHmm: string): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)

    const todayWithNewTime = new Date(
      this.now.getTime() - this.MILLISECONDS_IN_A_DAY,
    )
    todayWithNewTime.setUTCHours(hours, minutes, 0, 0)

    return todayWithNewTime
  }

  getHHmmMinutesFromNow(minutes: number): string {
    return this.toHHmm(this.getMinutesFromNow(minutes))
  }

  getMinutesFromNow(minutes: number): Date {
    return new Date(this.now.getTime() + minutes * 60 * 1000)
  }
}
