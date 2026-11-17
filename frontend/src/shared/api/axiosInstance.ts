import axios from 'axios'

// Cliente HTTP único. withCredentials: el navegador adjunta la cookie HttpOnly con el JWT en cada petición;
// el frontend nunca lee ni guarda el token.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  timeout: 10000,
  withCredentials: true,
})
