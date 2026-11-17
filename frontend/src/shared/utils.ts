const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })

export const formatMoneda = (valor: number): string => moneda.format(valor)

export const formatFecha = (iso: string): string =>
  new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
