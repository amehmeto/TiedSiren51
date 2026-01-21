import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'

export function assertBlockSessionFormComplete(
  values: BlockSessionFormValues,
): asserts values is BlockSessionFormValues & {
  name: string
  startedAt: string
  endedAt: string
} {
  const {
    name,
    blocklistIds,
    devices,
    startedAt,
    endedAt,
    blockingConditions,
  } = values

  if (
    !name ||
    !startedAt ||
    !endedAt ||
    blocklistIds.length === 0 ||
    devices.length === 0 ||
    blockingConditions.length === 0
  ) {
    throw new Error(
      `Some properties are invalid: ${JSON.stringify(values, null, 2)}`,
    )
  }
}
