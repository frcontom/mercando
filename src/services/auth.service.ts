import { APP_PASSWORD, SESSION_KEY } from '@/core/constants/password'

export class AuthService {
  validarPassword(password: string): boolean {
    return password === APP_PASSWORD
  }

  guardarSesion(): void {
    localStorage.setItem(SESSION_KEY, Date.now().toString())
  }

  tieneSesion(): boolean {
    return localStorage.getItem(SESSION_KEY) !== null
  }

  cerrarSesion(): void {
    localStorage.removeItem(SESSION_KEY)
  }
}

export const authService = new AuthService()
