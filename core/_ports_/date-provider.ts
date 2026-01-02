export type ISODateString =
  `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`

export type HHmmString = `${number}:${number}`

const HHMM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isHHmmString(value: string): value is HHmmString {
  return HHMM_PATTERN.test(value)
}

export function assertHHmmString(value: string): asserts value is HHmmString {
  if (!isHHmmString(value)) {
    throw new Error(
      `Invalid HHmm format: "${value}". Expected "HH:mm" (e.g., "09:30")`,
    )
  }
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

export function isISODateString(value: string): value is ISODateString {
  return ISO_DATE_PATTERN.test(value)
}

export function assertISODateString(
  value: string,
): asserts value is ISODateString {
  if (!isISODateString(value)) {
    throw new Error(
      `Invalid ISO date format: "${value}". Expected ISO 8601 (e.g., "2024-01-15T09:30:00.000Z")`,
    )
  }
}

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
