import { useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { BlocklistForm } from '@/ui/screens/Blocklists/BlocklistForm'

export default function EditBlocklistScreen() {
  const { blocklistId } = useLocalSearchParams<{ blocklistId: string }>()
  if (!blocklistId) return null

  return <BlocklistForm mode="edit" blocklistId={blocklistId} />
}
