import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { SettingsRow } from '@/ui/design-system/components/shared/SettingsRow'
import { SettingsSection } from '@/ui/design-system/components/shared/SettingsSection'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'
import { SecuritySection } from '@/ui/screens/Settings/SecuritySection'
import { selectSettingsViewModel } from '@/ui/screens/Settings/settings.view-model'

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const viewModel = useSelector(selectSettingsViewModel)

  const appVersion = Constants.expoConfig?.version ?? '0.0.0'

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Settings</Text>

      <SettingsSection title="Account">
        <SettingsRow
          label={viewModel.email}
          icon="mail-outline"
          hasDivider={true}
          accessibilityLabel={`Email: ${viewModel.email}`}
        />
        <SettingsRow
          label={viewModel.authProviderLabel}
          icon="key-outline"
          accessibilityLabel={`Sign-in method: ${viewModel.authProviderLabel}`}
        />
      </SettingsSection>

      {viewModel.hasPasswordProvider && (
        <SecuritySection
          onChangePassword={() =>
            router.push('/(tabs)/settings/change-password')
          }
        />
      )}

      <View style={styles.logoutContainer}>
        <TiedSButton
          text="Log Out"
          onPress={() => dispatch(logOut())}
          style={styles.logoutButton}
        />
      </View>

      <SettingsSection title="Danger Zone">
        <SettingsRow
          label="Delete Account"
          labelColor={T.color.red}
          hasChevron={true}
          onPress={() => router.push('/(tabs)/settings/delete-account')}
        />
      </SettingsSection>

      <Text style={styles.version}>v{appVersion}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: T.spacing.medium,
    paddingBottom: T.spacing.xxx_large,
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.xLarge,
    fontWeight: T.font.weight.bold,
    marginBottom: T.spacing.large,
  },
  logoutContainer: {
    marginBottom: T.spacing.medium,
  },
  logoutButton: {
    backgroundColor: T.color.darkBlueGray,
    marginTop: T.spacing.none,
  },
  version: {
    color: T.color.grey,
    fontSize: T.font.size.small,
    textAlign: 'center',
    marginTop: T.spacing.large,
  },
})
