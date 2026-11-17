import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// Reúne la Navbar y el contenido de la ruta activa
function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
