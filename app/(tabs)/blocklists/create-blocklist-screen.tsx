import { FormMode } from '@/ui/screens/Blocklists/blocklist-form.view-model'
import { BlocklistForm } from '@/ui/screens/Blocklists/BlocklistForm'

export default function CreateBlocklistScreen() {
  return <BlocklistForm mode={FormMode.Create} />
}
