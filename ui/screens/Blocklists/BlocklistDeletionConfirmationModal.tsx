import { StyleSheet, Text, View } from 'react-native'
import { BlockSession } from '@/core/block-session/block-session'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'

export function BlocklistDeletionConfirmationModal(props: {
  visible: boolean
  blocklistName: string
  activeSessions: BlockSession[]
  onRequestClose: () => void
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <TiedSModal
      style={styles.modal}
      isVisible={props.visible}
      onRequestClose={props.onRequestClose}
    >
      <Text style={styles.title}>Delete Blocklist?</Text>
      <Text style={styles.warningText}>
        The blocklist "{props.blocklistName}" is currently used by the following
        active sessions:
      </Text>
      <View style={styles.sessionList}>
        {props.activeSessions.map((session) => (
          <Text key={session.id} style={styles.sessionItem}>
            • {session.name}
          </Text>
        ))}
      </View>
      <Text style={styles.warningText}>
        Deleting it will immediately stop blocking the sirens from this
        blocklist in these sessions.
      </Text>
      <View style={styles.buttonContainer}>
        <TiedSButton
          style={styles.cancelButton}
          onPress={props.onCancel}
          text={'Cancel'}
        />
        <TiedSButton
          style={styles.confirmButton}
          onPress={props.onConfirm}
          text={'Delete'}
        />
      </View>
    </TiedSModal>
  )
}

const styles = StyleSheet.create({
  modal: {
    flexDirection: 'column',
    padding: T.spacing.large,
  },
  title: {
    color: T.color.textSecondary,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.medium,
    textAlign: 'center',
  },
  warningText: {
    color: T.color.textSecondary,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.small,
    lineHeight: T.font.size.base * T.font.lineHeight.normal,
  },
  sessionList: {
    marginVertical: T.spacing.small,
    paddingLeft: T.spacing.small,
  },
  sessionItem: {
    color: T.color.textSecondary,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.primary,
    fontWeight: T.font.weight.semibold,
    marginBottom: T.spacing.extraSmall,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: T.layout.width.full,
    marginTop: T.spacing.medium,
  },
  cancelButton: {
    marginRight: T.spacing.small,
  },
  confirmButton: {
    backgroundColor: T.color.red,
  },
})
