import { type StyleProp, type ViewStyle } from 'react-native'
import {
  TiedSButton,
  type TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { openEmailApp } from './open-email-app'

interface OpenEmailAppButtonProps {
  email: string
  label: string
  variant?: TiedSButtonVariant
  style?: StyleProp<ViewStyle>
}

export function OpenEmailAppButton({
  email,
  label,
  variant,
  style,
}: OpenEmailAppButtonProps) {
  return (
    <TiedSButton
      text={label}
      onPress={() => openEmailApp(email)}
      variant={variant}
      style={style}
    />
  )
}
