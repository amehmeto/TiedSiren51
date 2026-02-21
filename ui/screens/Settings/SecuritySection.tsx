import { SettingsRow } from '@/ui/design-system/components/shared/SettingsRow'
import { SettingsSection } from '@/ui/design-system/components/shared/SettingsSection'

type SecuritySectionOwnProps = {
  onChangePassword: () => void
}

type SecuritySectionProps = Readonly<SecuritySectionOwnProps>

export function SecuritySection({ onChangePassword }: SecuritySectionProps) {
  return (
    <SettingsSection title="Security">
      <SettingsRow
        icon="lock-closed-outline"
        label="Change Password"
        hasChevron
        onPress={onChangePassword}
      />
    </SettingsSection>
  )
}
