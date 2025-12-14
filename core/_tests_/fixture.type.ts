// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FixtureMethods = Record<string, (...args: any[]) => any>

export type Fixture = {
  given: FixtureMethods
  when: FixtureMethods
  then: FixtureMethods
}
