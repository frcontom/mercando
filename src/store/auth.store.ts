import { signal } from '@preact/signals-react'
import { authService } from '@/services'

export const isAuthenticated = signal(authService.tieneSesion())

export function login(password: string): boolean {
  const valid = authService.validarPassword(password)
  if (valid) {
    authService.guardarSesion()
    isAuthenticated.value = true
  }
  return valid
}

export function logout(): void {
  authService.cerrarSesion()
  isAuthenticated.value = false
}
