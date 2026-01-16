import { FormikErrors } from 'formik'
import { StyleSheet, Text } from 'react-native'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Device } from '@/core/device/device'
import { T } from '@/ui/design-system/theme'

type FormErrorProps = {
  error?: string | FormikErrors<Blocklist> | FormikErrors<Device>
}

export function FormError({ error }: FormErrorProps) {
  const errorText = typeof error === 'string' ? error : JSON.stringify(error)

  return <Text style={styles.errorText}>{errorText}</Text>
}

const styles = StyleSheet.create({
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.small,
    marginTop: T.spacing.extraSmall,
    fontWeight: T.font.weight.bold,
  },
})
