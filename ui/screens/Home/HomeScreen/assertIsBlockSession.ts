import { BlockSession } from '@/core/block-session/block-session'
import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'

function hasSomeEmptyField(values: Session) {
  const { name, blocklists, devices, startedAt, endedAt, blockingConditions } =
    values
  return (
    !name ||
    !startedAt ||
    !endedAt ||
    blocklists.length === 0 ||
    devices.length === 0 ||
    blockingConditions.length === 0
  )
}

export function assertIsBlockSession(
  values: Session,
): asserts values is BlockSession {
  if (hasSomeEmptyField(values)) {
    throw new Error(
      `Some properties are invalid: ${JSON.stringify(values, null, 2)}`,
    )
  }
}
