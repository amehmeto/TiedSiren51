import { Formik } from 'formik'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Device } from '@/core/device/device'
import { AppDispatch } from '@/core/_redux_/createStore'
import { useDispatch } from 'react-redux'
import {
  createBlockSession,
  CreateBlockSessionPayload,
} from '@/core/block-session/usecases/create-block-session.usecase'
import uuid from 'react-native-uuid'
import { BlockingConditions } from '@/core/block-session/block.session'
import {
  updateBlockSession,
  UpdateBlockSessionPayload,
} from '@/core/block-session/usecases/update-block-session.usecase'
import { SelectBlockSessionParams } from '@/ui/screens/Home/shared/SelectBlockSessionParams'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { useRouter } from 'expo-router'
import { assertIsBlockSession } from '@/ui/screens/Home/HomeScreen/assertIsBlockSession'
import { validateBlockSessionForm } from '@/ui/screens/Home/schemas/validate-block-session-form'

export type Session = {
  id: string
  name: string | null
  blocklists: Blocklist[]
  devices: Device[]
  startedAt: string | null
  endedAt: string | null
  blockingConditions: BlockingConditions[]
}

const defaultSession: Session = {
  id: uuid.v4().toString(),
  name: null,
  blocklists: [] as Blocklist[],
  devices: [] as Device[],
  startedAt: null,
  endedAt: null,
  blockingConditions: [] as BlockingConditions[],
}

export function BlockSessionForm({
  session = defaultSession,
  mode,
}: Readonly<{
  mode: 'create' | 'edit'
  session?: Session
}>) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  function saveBlockSession() {
    return (values: Session) => {
      assertIsBlockSession(values)

      if (mode === 'edit') {
        dispatch(updateBlockSession(values as UpdateBlockSessionPayload))
      } else {
        dispatch(createBlockSession(values as CreateBlockSessionPayload))
      }

      router.push('/(tabs)')
    }
  }

  return (
    <TiedSLinearBackground>
      <Formik
        initialValues={session}
        validate={validateBlockSessionForm()}
        onSubmit={saveBlockSession()}
      >
        {(form) => <SelectBlockSessionParams form={form} />}
      </Formik>
    </TiedSLinearBackground>
  )
}
