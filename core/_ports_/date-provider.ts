export type ISODateString =
  `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`

export type HHmmString = `${number}:${number}`

export interface DateProvider {
  getNow(): Date
  getNowMs(): number
  getISOStringNow(): ISODateString
  getHHmmNow(): HHmmString
  recoverDate(timeInHHmm: HHmmString): Date
  recoverYesterdayDate(startedAt: HHmmString): Date
  toHHmm(date: Date): HHmmString
  getMinutesFromNow(minutes: number): Date
  getHHmmMinutesFromNow(minutes: number): HHmmString
  parseISOString(isoString: ISODateString): Date
  toISOString(date: Date): ISODateString
  msToISOString(ms: number): ISODateString
}
