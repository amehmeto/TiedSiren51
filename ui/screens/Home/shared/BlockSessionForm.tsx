import { useRouter } from 'expo-router'
import { Formik } from 'formik'
import uuid from 'react-native-uuid'
import { useDispatch } from 'react-redux'
import { HHmmString } from '@/core/_ports_/date-provider'
import { AppDispatch } from '@/core/_redux_/createStore'
import { BlockingConditions } from '@/core/block-session/block-session'
import { createBlockSession } from '@/core/block-session/usecases/create-block-session.usecase'
import { updateBlockSession } from '@/core/block-session/usecases/update-block-session.usecase'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Device } from '@/core/device/device'
import { assertIsBlockSession } from '@/ui/screens/Home/HomeScreen/assertIsBlockSession'
import { validateBlockSessionForm } from '@/ui/screens/Home/schemas/validate-block-session-form'
import { SelectBlockSessionParams } from '@/ui/screens/Home/shared/SelectBlockSessionParams'

export type Session = {
  id: string
  name: string | null
  blocklists: Blocklist[]
  devices: Device[]
  startedAt: string | null
  endedAt: string | null
  blockingConditions: BlockingConditions[]
}

export type ValidatedSession = {
  id: string
  name: string
  blocklists: Blocklist[]
  devices: Device[]
  startedAt: HHmmString
  endedAt: HHmmString
  blockingConditions: BlockingConditions[]
}

const defaultSession: Session = {
  id: uuid.v4().toString(),
  name: null,
  blocklists: [],
  devices: [],
  startedAt: null,
  endedAt: null,
  blockingConditions: [],
}

type BlockSessionFormProps = Readonly<{
  mode: 'create' | 'edit'
  session?: Session
}>

export function BlockSessionForm({
  session = defaultSession,
  mode,
}: BlockSessionFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  function saveBlockSession() {
    return (session: Session) => {
      assertIsBlockSession(session)

      const { blocklists, ...rest } = session
      const blockSessionPayload = {
        ...rest,
        blocklistIds: blocklists.map((bl) => bl.id),
      }

      if (mode === 'edit' && 'id' in session)
        dispatch(updateBlockSession(blockSessionPayload))
      else dispatch(createBlockSession(blockSessionPayload))

      router.push('/(tabs)')
    }
  }

  return (
    <Formik
      initialValues={session}
      validate={validateBlockSessionForm()}
      onSubmit={saveBlockSession()}
    >
      {(form) => <SelectBlockSessionParams form={form} />}
    </Formik>
  )
}
