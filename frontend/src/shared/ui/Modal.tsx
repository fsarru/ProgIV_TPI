import type { ReactNode } from 'react'

interface ModalProps {
  titulo: string
  onCerrar: () => void
  children: ReactNode
}

// Contenedor del modal. Quien lo usa decide si se renderiza (estado booleano en la página).
function Modal({ titulo, onCerrar, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
