/**
 * Fixture type enforcing the Given-When-Then pattern for tests
 *
 * Ensures all fixtures return an object with given, when, and then properties,
 * where each property is an object containing methods.
 *
 * @example
 * ```typescript
 * export function myFixture(): Fixture {
 *   return {
 *     given: {
 *       userExists(): void { ... },
 *       nowIs(time: Date): void { ... }
 *     },
 *     when: {
 *       userLogsIn(): Promise<void> { ... }
 *     },
 *     then: {
 *       shouldBeAuthenticated(): void { ... }
 *     }
 *   }
 * }
 * ```
 */
export type Fixture = {
  given: Record<string, (...args: any[]) => any>
  when: Record<string, (...args: any[]) => any>
  then: Record<string, (...args: any[]) => any>
}
