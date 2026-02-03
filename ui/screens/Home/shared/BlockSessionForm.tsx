import { useRouter } from 'expo-router'
import { Formik } from 'formik'
import uuid from 'react-native-uuid'
import { useDispatch } from 'react-redux'
import { assertHHmmString } from '@/core/_ports_/date-provider'
import { AppDispatch } from '@/core/_redux_/createStore'
import { BlockingConditions } from '@/core/block-session/block-session'
import { createBlockSession } from '@/core/block-session/usecases/create-block-session.usecase'
import { updateBlockSession } from '@/core/block-session/usecases/update-block-session.usecase'
import { Device } from '@/core/device/device'
import { assertBlockSessionFormComplete } from '@/ui/screens/Home/schemas/assert-block-session-form-complete'
import { validateBlockSessionForm } from '@/ui/screens/Home/schemas/validate-block-session-form'
import { SelectBlockSessionParams } from '@/ui/screens/Home/shared/SelectBlockSessionParams'

export type BlockSessionFormValues = {
  id: string
  name: string | null
  blocklistIds: string[]
  devices: Device[]
  startedAt: string | null
  endedAt: string | null
  blockingConditions: BlockingConditions[]
}

const defaultFormValues: BlockSessionFormValues = {
  id: uuid.v4().toString(),
  name: null,
  blocklistIds: [],
  devices: [],
  startedAt: null,
  endedAt: null,
  blockingConditions: [],
}

type BlockSessionFormProps = Readonly<{
  mode: 'create' | 'edit'
  initialValues?: BlockSessionFormValues
  isStrictModeActive?: boolean
}>

export function BlockSessionForm({
  initialValues = defaultFormValues,
  mode,
  isStrictModeActive = false,
}: BlockSessionFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  function saveBlockSession() {
    return (values: BlockSessionFormValues) => {
      assertBlockSessionFormComplete(values)

      const {
        id,
        name,
        blocklistIds,
        devices,
        startedAt,
        endedAt,
        blockingConditions,
      } = values

      assertHHmmString(startedAt)
      assertHHmmString(endedAt)

      const blockSessionPayload = {
        id,
        name,
        blocklistIds,
        devices,
        startedAt,
        endedAt,
        blockingConditions,
      }

      if (mode === 'edit') dispatch(updateBlockSession(blockSessionPayload))
      else dispatch(createBlockSession(blockSessionPayload))

      router.push('/(tabs)')
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validate={validateBlockSessionForm()}
      onSubmit={saveBlockSession()}
    >
      {(form) => (
        <SelectBlockSessionParams
          form={form}
          isStrictModeActive={isStrictModeActive}
          initialValues={initialValues}
        />
      )}
    </Formik>
  )
}
