import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { Fixture } from './fixture.types'

export function dateFixture(dateProvider: StubDateProvider): Fixture {
  return {
    given: {
      nowIs({ hours, minutes }: { hours: number; minutes: number }) {
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        dateProvider.now = date
      },
    },
    when: {},
    then: {},
  }
}
