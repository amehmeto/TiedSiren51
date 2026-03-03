import { useRouter } from 'expo-router'
import { Formik } from 'formik'
import uuid from 'react-native-uuid'
import { useDispatch, useSelector } from 'react-redux'
import { assertHHmmString, HHmmString } from '@/core/_ports_/date-provider'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { BlockingConditions } from '@/core/block-session/block-session'
import { selectBlockSessionById } from '@/core/block-session/selectors/selectBlockSessionById'
import { createBlockSession } from '@/core/block-session/usecases/create-block-session.usecase'
import { updateBlockSession } from '@/core/block-session/usecases/update-block-session.usecase'
import { Device } from '@/core/device/device'
import { selectFeatureFlags } from '@/core/feature-flag/selectors/selectFeatureFlags'
import { assertBlockSessionFormComplete } from '@/ui/screens/Home/schemas/assert-block-session-form-complete'
import { validateBlockSessionForm } from '@/ui/screens/Home/schemas/validate-block-session-form'
import { currentDevice } from '@/ui/screens/Home/shared/current-device'
import { SelectBlockSessionParams } from '@/ui/screens/Home/shared/SelectBlockSessionParams'

export type BlockSessionFormValues = {
  id: string
  name: string | null
  blocklistIds: string[]
  devices: Device[]
  startedAt: HHmmString | null
  endedAt: HHmmString | null
  blockingConditions: BlockingConditions[]
}

const defaultFormValues: BlockSessionFormValues = {
  id: uuid.v4().toString(),
  name: null,
  blocklistIds: [],
  devices: [currentDevice],
  startedAt: null,
  endedAt: null,
  blockingConditions: [BlockingConditions.TIME],
}

type BlockSessionFormCreateMode = { mode: 'create' }

type BlockSessionFormEditMode = { mode: 'edit'; sessionId: string }

type BlockSessionFormProps = Readonly<
  BlockSessionFormCreateMode | BlockSessionFormEditMode
>

export function BlockSessionForm({ mode, ...rest }: BlockSessionFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const featureFlags = useSelector(selectFeatureFlags)
  const sessionId = 'sessionId' in rest ? rest.sessionId : undefined
  const blockSession = useSelector((state: RootState) =>
    selectBlockSessionById(state, sessionId),
  )
  const initialValues = blockSession ?? defaultFormValues

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

      router.push('/home')
    }
  }

  const validateForm = validateBlockSessionForm(featureFlags)

  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={saveBlockSession()}
    >
      {(form) => <SelectBlockSessionParams form={form} />}
    </Formik>
  )
}
