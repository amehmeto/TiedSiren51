import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { AndroidSirenLookout } from '@/core/_ports_/siren.lookout'
import { AppDispatch } from '@/core/_redux_/createStore'
import { giveAccessibilityConsent } from '@/core/accessibility-consent/usecases/give-accessibility-consent.usecase'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'

interface AccessibilityDisclosureScreenProps {
  sirenLookout: AndroidSirenLookout
}

export function AccessibilityDisclosureScreen({
  sirenLookout,
}: AccessibilityDisclosureScreenProps) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const handleAgree = async () => {
    await dispatch(giveAccessibilityConsent())
    await sirenLookout.askPermission()
    router.back()
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="shield-check"
          size={T.icon.size.xxLarge}
          color={T.color.lightBlue}
        />
      </View>

      <Text style={styles.title}>How Tied Siren blocks apps</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What data is accessed</Text>
        <Text style={styles.sectionBody}>
          Tied Siren reads only the package name of the app currently in the
          foreground.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why this is needed</Text>
        <Text style={styles.sectionBody}>
          This is the only way to detect when you open a blocked app and display
          the blocking overlay.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What is NOT accessed</Text>
        <Text style={styles.sectionBody}>
          We do not read screen content, keystrokes, personal information, or
          any other data.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data handling</Text>
        <Text style={styles.sectionBody}>
          This data is processed in real time on your device. It is never
          stored, logged, or transmitted.
        </Text>
      </View>

      <TiedSButton
        onPress={() => void handleAgree()}
        text="I understand and agree"
      />

      <TiedSButton
        onPress={() => router.back()}
        text="Not now"
        variant={TiedSButtonVariant.Secondary}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: T.spacing.xx_large,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: T.spacing.large,
  },
  title: {
    fontSize: T.font.size.large,
    fontFamily: T.font.family.heading,
    color: T.color.text,
    textAlign: 'center',
    marginBottom: T.spacing.xx_large,
  },
  section: {
    marginBottom: T.spacing.large,
    backgroundColor: T.color.lightBlueOverlay,
    borderRadius: T.border.radius.roundedMedium,
    padding: T.spacing.medium,
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
  },
  sectionTitle: {
    fontSize: T.font.size.base,
    fontFamily: T.font.family.semibold,
    color: T.color.lightBlue,
    marginBottom: T.spacing.small,
  },
  sectionBody: {
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    color: T.color.textMuted,
    lineHeight: T.font.size.medium,
  },
})
