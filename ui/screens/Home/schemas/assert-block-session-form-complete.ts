import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'

type CompleteBlockSessionFormValues = BlockSessionFormValues & {
  name: string
  startedAt: string
  endedAt: string
}

export function assertBlockSessionFormComplete(
  values: BlockSessionFormValues,
): asserts values is CompleteBlockSessionFormValues {
  const { name, blocklistIds, startedAt, endedAt } = values

  if (!name || !startedAt || !endedAt || blocklistIds.length === 0) {
    throw new Error(
      `Some properties are invalid: ${JSON.stringify(values, null, 2)}`,
    )
  }
}
