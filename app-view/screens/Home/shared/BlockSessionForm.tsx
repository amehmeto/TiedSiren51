import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Formik } from 'formik'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Device } from '@/core/device/device'
import { AppDispatch } from '@/core/_redux_/createStore'
import { useDispatch } from 'react-redux'
import { createBlockSession } from '@/core/block-session/usecases/create-block-session.usecase'
import uuid from 'react-native-uuid'
import { BlockSession } from '@/core/block-session/block.session'
import { updateBlockSession } from '@/core/block-session/usecases/update-block-session.usecase'
import { TiedSLinearBackground } from '@/app-view/design-system/components/components/TiedSLinearBackground'
import { SelectBlockSessionParams } from '@/app-view/screens/Home/shared/SelectBlockSessionParams'
import { ScreenList } from '@/app-view/screen-lists/screenLists'
import { TabScreens } from '@/app-view/screen-lists/TabScreens'

export type Session = {
  id: string
  name: string | null
  blocklists: Blocklist[]
  devices: Device[]
  startedAt: string | null
  endedAt: string | null
}

const defaultSession: Session = {
  id: uuid.v4().toString(),
  name: null,
  blocklists: [] as Blocklist[],
  devices: [] as Device[],
  startedAt: null,
  endedAt: null,
}

export function BlockSessionForm({
  navigation,
  session = defaultSession,
  mode,
}: Readonly<{
  navigation: NativeStackNavigationProp<ScreenList, TabScreens.HOME>
  mode: 'create' | 'edit'
  session?: Session
}>) {
  const dispatch = useDispatch<AppDispatch>()

  /*  const validationSchema = z.object({
    id: z.string(),
    name: z.string(),
    blocklists: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        totalBlocks: z.number(),
      }),
    ),
    devices: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    ),
    start: z.string(),
    end: z.string(),
  })*/

  function assertIsBlockSession(
    values: Session,
  ): asserts values is BlockSession {
    if (!Object.values(values).every((value) => value !== null)) {
      throw new Error(
        `Some properties are null ${JSON.stringify(values, null, 2)}`,
      )
    }
  }

  return (
    <TiedSLinearBackground>
      <Formik
        initialValues={session}
        /*
        validate={(values) => {
          try {
            console.log('Validate values')
            return validationSchema.parse(values)
          } catch (e) {
            if (e instanceof z.ZodError) return e.formErrors.fieldErrors

            return e
          }
        }}
        */
        onSubmit={(values) => {
          assertIsBlockSession(values)
          // eslint-disable-next-line no-unused-expressions
          mode === 'edit'
            ? dispatch(updateBlockSession(values))
            : dispatch(createBlockSession(values))
        }}
      >
        {(form) => (
          <SelectBlockSessionParams form={form} navigation={navigation} />
        )}
      </Formik>
    </TiedSLinearBackground>
  )
}
