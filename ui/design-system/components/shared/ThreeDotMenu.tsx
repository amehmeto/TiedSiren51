import { Ionicons } from '@expo/vector-icons'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
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

type MenuPosition = {
  top: number
  right: number
}

export function ThreeDotMenu({ menuOptions, style }: ThreeDotMenuProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    right: 0,
  })
  const { width: windowWidth } = useWindowDimensions()
  const dispatch = useDispatch<AppDispatch>()
  const triggerRef = useRef<View>(null)

  const menuWidth = useMemo(() => {
    const fortyPercent = windowWidth * 0.4
    const seventyPercent = windowWidth * 0.7
    const minWidth = 160

    const lowerBound = Math.max(fortyPercent, minWidth)
    return Math.min(lowerBound, seventyPercent)
  }, [windowWidth])

  const openMenu = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({
        top: y + height,
        right: windowWidth - (x + width),
      })
      setIsVisible(true)
    })
  }, [windowWidth])

  const closeMenu = useCallback(() => setIsVisible(false), [])

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
        ref={triggerRef}
        onPress={openMenu}
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
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Pressable>
            <TiedSCard
              style={[
                styles.menuOptions,
                {
                  width: menuWidth,
                  top: menuPosition.top,
                  right: menuPosition.right,
                },
              ]}
            >
              {menuOptions.map((menuOption) => (
                <TiedSMenuOption
                  key={menuOption.name}
                  option={menuOption}
                  onSelect={selectMenuOption}
                />
              ))}
            </TiedSCard>
          </Pressable>
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
    backgroundColor: T.color.modalBackgroundColor,
  },
  menuOptions: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: T.spacing.none,
  },
})
