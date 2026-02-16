import { calculateMilliseconds } from '@/core/__utils__/time.utils'
import { DateProvider } from '@/core/_ports_/date-provider'

type FormatEndFromOffsetsParams = {
  now?: Date
  days: number
  hours: number
  minutes: number
  dateProvider: DateProvider
}

export const formatEndFromOffsets = (
  params: FormatEndFromOffsetsParams,
): string => {
  const { now = new Date(), days, hours, minutes, dateProvider } = params

  const durationMs = calculateMilliseconds({ days, hours, minutes })
  const endTime = new Date(now.getTime() + durationMs)

  const day = endTime.getDate()
  const month = endTime.getMonth() + 1
  const time12Hour = dateProvider.to12HourTime(endTime)

  return `Ends ${day}/${month}, ${time12Hour}`
}
