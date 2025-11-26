export interface DateProvider {
  getNow(): Date
  getNowMs(): number
  getISOStringNow(): string
  recoverDate(timeInHHmm: string): Date
  recoverYesterdayDate(startedAt: string): Date
  toHHmm(date: Date): string
  getMinutesFromNow(minutes: number): Date
  getHHmmMinutesFromNow(minutes: number): string
  parseISOString(isoString: string): Date
  toISOString(date: Date): string
  msToISOString(ms: number): string
}
