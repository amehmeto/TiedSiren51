import { StyleSheet, Text } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { FormikErrors } from 'formik'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Device } from '@/core/device/device'

export function FormError({
  error,
}: {
  error?: string | FormikErrors<Blocklist> | FormikErrors<Device>
}) {
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
