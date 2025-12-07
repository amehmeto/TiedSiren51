export type ISODateString =
  `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`

export interface DateProvider {
  getNow(): Date
  getNowMs(): number
  getISOStringNow(): ISODateString
  recoverDate(timeInHHmm: string): Date
  recoverYesterdayDate(startedAt: string): Date
  toHHmm(date: Date): string
  getMinutesFromNow(minutes: number): Date
  getHHmmMinutesFromNow(minutes: number): string
  parseISOString(isoString: ISODateString): Date
  toISOString(date: Date): ISODateString
  msToISOString(ms: number): ISODateString
}
