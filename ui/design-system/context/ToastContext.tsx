import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'
import { TiedSToast } from '@/ui/design-system/components/shared/TiedSToast'

type ToastContextType = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

type ToastProviderProps = Readonly<{
  children: ReactNode
}>

export function ToastProvider({ children }: ToastProviderProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')

  const showToast = useCallback((toastMessage: string) => {
    setMessage(toastMessage)
    setIsVisible(true)
  }, [])

  const handleHide = useCallback(() => {
    setIsVisible(false)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <TiedSToast message={message} isVisible={isVisible} onHide={handleHide} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')

  return context
}
