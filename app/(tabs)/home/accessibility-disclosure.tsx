import { Platform } from 'react-native'
import { isAndroidSirenLookout } from '@/core/_ports_/siren.lookout'
import { dependencies } from '@/ui/dependencies'
import { AccessibilityDisclosureScreen } from '@/ui/screens/Home/AccessibilityDisclosure/AccessibilityDisclosureScreen'

export default function AccessibilityDisclosureRoute() {
  const { sirenLookout } = dependencies

  if (Platform.OS !== 'android' || !isAndroidSirenLookout(sirenLookout))
    return null

  return <AccessibilityDisclosureScreen sirenLookout={sirenLookout} />
}
