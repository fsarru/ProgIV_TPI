import { create } from 'zustand'

export type NotificationType = 'success' | 'error'

interface NotificationState {
  message: string
  type: NotificationType
  show: boolean
  /** Cambia en cada llamada: un mismo texto repetido también reinicia el temporizador del Toast */
  id: number
  showNotification: (message: string, type?: NotificationType) => void
  hideNotification: () => void
}

// Maneja una notificación a la vez: una nueva reemplaza a la anterior
export const useNotificationStore = create<NotificationState>()((set) => ({
  message: '',
  type: 'success',
  show: false,
  id: 0,
  showNotification: (message, type = 'success') =>
    set((state) => ({ message, type, show: true, id: state.id + 1 })),
  hideNotification: () => set({ message: '', show: false }),
}))
