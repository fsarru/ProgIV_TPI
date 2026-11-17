import { useEffect } from 'react'
import { useNotificationStore } from '@/store/notificationStore'

// Se monta UNA sola vez, en App.tsx
function Toast() {
  const message = useNotificationStore((s) => s.message)
  const type = useNotificationStore((s) => s.type)
  const show = useNotificationStore((s) => s.show)
  const id = useNotificationStore((s) => s.id)
  const hideNotification = useNotificationStore((s) => s.hideNotification)

  useEffect(() => {
    if (!show) return
    const timer = setTimeout(hideNotification, 3000) // se oculta solo a los 3 s
    return () => clearTimeout(timer) // un mensaje nuevo (id distinto) reinicia el tiempo
  }, [show, id, hideNotification])

  if (!show) return null

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`fixed right-4 bottom-4 z-50 max-w-sm rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
        type === 'error' ? 'bg-error' : 'bg-success'
      }`}
    >
      {message}
    </div>
  )
}

export default Toast
