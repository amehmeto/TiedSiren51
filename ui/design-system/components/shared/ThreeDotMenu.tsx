import { Ionicons } from '@expo/vector-icons'
import { useCallback, useMemo, useState } from 'react'
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { showToast } from '@/core/toast/toast.slice'
import { T } from '@/ui/design-system/theme'
import { TiedSCard } from './TiedSCard'
import { TiedSMenuOption } from './TiedSMenuOption'

type IconName =
  | 'text-outline'
  | 'create-outline'
  | 'copy-outline'
  | 'trash-outline'

export type TiedSMenu = {
  name: string
  iconName: IconName
  action: () => void
  isDisabled?: boolean
  disabledMessage?: string
}

type ThreeDotMenuOwnProps = {
  menuOptions: TiedSMenu[]
  style?: StyleProp<ViewStyle>
}

type ThreeDotMenuProps = Readonly<ThreeDotMenuOwnProps>

export function ThreeDotMenu({ menuOptions, style }: ThreeDotMenuProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { width: windowWidth } = useWindowDimensions()
  const dispatch = useDispatch<AppDispatch>()

  const menuWidth = useMemo(() => {
    const fortyPercent = windowWidth * 0.4
    const seventyPercent = windowWidth * 0.7
    const minWidth = 160

    const lowerBound = Math.max(fortyPercent, minWidth)
    return Math.min(lowerBound, seventyPercent)
  }, [windowWidth])

  const selectMenuOption = useCallback(
    (optionName: TiedSMenu['name']) => {
      const selectedOption = menuOptions.find(
        (option) => option.name === optionName,
      )
      if (!selectedOption) throw new Error('Invalid menu option')

      if (selectedOption.isDisabled) {
        const message =
          selectedOption.disabledMessage ?? 'This action is currently disabled'
        dispatch(showToast(message))
        setIsVisible(false)
        return
      }

      setIsVisible(false)
      selectedOption.action()
    },
    [menuOptions, dispatch],
  )

  return (
    <>
      <Pressable
        onPress={() => setIsVisible(true)}
        style={[styles.menuTrigger, style]}
      >
        <Ionicons
          name={'ellipsis-horizontal'}
          size={T.icon.size.xxLarge}
          color={T.color.text}
        />
      </Pressable>
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsVisible(false)}>
          <TiedSCard style={[styles.menuOptions, { width: menuWidth }]}>
            {menuOptions.map((menuOption) => (
              <TiedSMenuOption
                key={menuOption.name}
                option={menuOption}
                onSelect={selectMenuOption}
              />
            ))}
          </TiedSCard>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  menuTrigger: {
    padding: T.spacing.small,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: T.color.modalBackgroundColor,
  },
  menuOptions: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: T.spacing.none,
  },
})
