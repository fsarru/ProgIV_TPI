import { useEffect, useState } from 'react'

/** Devuelve el valor recién después de `delay` ms sin cambios (evita una petición por cada tecla). */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
