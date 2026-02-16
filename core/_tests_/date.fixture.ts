import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { Fixture } from './fixture.type'

type TimeOfDay = { hours: number; minutes: number }

export function dateFixture(dateProvider: StubDateProvider): Fixture {
  return {
    given: {
      nowIs({ hours, minutes }: TimeOfDay) {
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        dateProvider.now = date
      },
    },
    when: {},
    then: {},
  }
}
