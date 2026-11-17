interface ErroresCampoProps {
  errores: unknown[]
}

// Muestra los mensajes de validación de un campo de TanStack Form
function ErroresCampo({ errores }: ErroresCampoProps) {
  return (
    <>
      {errores.map((err) => (
        <p key={String(err)} className="field-error">
          {String(err)}
        </p>
      ))}
    </>
  )
}

export default ErroresCampo
