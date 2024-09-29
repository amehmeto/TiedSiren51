import { Formik } from 'formik'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Device } from '@/core/device/device'
import { AppDispatch } from '@/core/_redux_/createStore'
import { useDispatch } from 'react-redux'
import { createBlockSession } from '@/core/block-session/usecases/create-block-session.usecase'
import uuid from 'react-native-uuid'
import { BlockSession } from '@/core/block-session/block.session'
import { updateBlockSession } from '@/core/block-session/usecases/update-block-session.usecase'
import { SelectBlockSessionParams } from '@/ui/screens/Home/shared/SelectBlockSessionParams'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { z } from 'zod'
import { useRouter } from 'expo-router'
import { ErrorMessages } from '../../Blocklists/BlocklistForm'

export type Session = {
  blockingCondition?: string
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
  blockingCondition: '',
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

  const validationSchema = z.object({
    id: z.string(),
    name: z
      .string()
      .nullable()
      .refine((val) => val !== null && val.trim() !== '', {
        message: 'A session name must be provided',
      }),
    blocklists: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          // totalBlocks: z.number(),
        }),
      )
      .min(1, { message: 'At least one blocklist must be selected' }),
    devices: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        }),
      )
      .min(1, { message: 'At least one device must be selected' }),
    startedAt: z
      .string()
      .nullable()
      .refine((val) => val !== null && val.trim() !== '', {
        message: 'A start time must be provided',
      }),
    endedAt: z
      .string()
      .nullable()
      .refine((val) => val !== null && val.trim() !== '', {
        message: 'An end time must be provided',
      }),
    blockingCondition: z
      .string()
      .nullable()
      .refine((val) => val !== null && val.trim() !== '', {
        message: 'A blocking condition must be selected',
      }),
  })

  function hasSomeEmptyField(values: Session) {
    const { name, blocklists, devices, startedAt, endedAt, blockingCondition } =
      values
    return (
      !name ||
      blocklists.length === 0 ||
      devices.length === 0 ||
      !startedAt ||
      !endedAt ||
      !blockingCondition
    )
  }

  function assertIsBlockSession(
    values: Session,
  ): asserts values is BlockSession {
    if (hasSomeEmptyField(values)) {
      throw new Error(
        `Some properties are invalid: ${JSON.stringify(values, null, 2)}`,
      )
    }
  }

  return (
    <TiedSLinearBackground>
      <Formik
        initialValues={session}
        validate={(values) => {
          try {
            validationSchema.parse(values)
            return {}
          } catch (e) {
            if (!(e instanceof z.ZodError)) return {}
            const validationErrors: ErrorMessages = {}
            e.errors.forEach((error) => {
              const field = error.path[0] as string
              validationErrors[field] = error.message
            })
            return validationErrors
          }
        }}
        onSubmit={(values) => {
          assertIsBlockSession(values)
          // eslint-disable-next-line no-unused-expressions
          mode === 'edit'
            ? dispatch(updateBlockSession(values))
            : dispatch(createBlockSession(values))
          router.push('/(tabs)')
        }}
      >
        {(form) => <SelectBlockSessionParams form={form} />}
      </Formik>
    </TiedSLinearBackground>
  )
}
