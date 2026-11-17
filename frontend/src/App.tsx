import { useEffect } from 'react'
import { AppRouter } from '@/routes/AppRouter'
import Toast from '@/shared/layout/Toast'
import { useAuthStore } from '@/store/authStore'

// App solo compone la aplicación. La ÚNICA llamada en useEffect es checkSession al montar.
function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  useEffect(() => {
    checkSession() // GET /auth/me con la cookie, una sola vez
  }, [checkSession])

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  )
}

export default App
