import { signal } from '@preact/signals-react'
import { APP_PASSWORD, BUYER_PASSWORD, SESSION_KEY, ROLE_KEY } from '@/core/constants/password'

export type UserRole = 'admin' | 'buyer'

export const isAuthenticated = signal(!!localStorage.getItem(SESSION_KEY))
export const userRole = signal<UserRole>((localStorage.getItem(ROLE_KEY) as UserRole) ?? 'admin')

export function login(password: string): UserRole | null {
  if (password === APP_PASSWORD) {
    localStorage.setItem(SESSION_KEY, Date.now().toString())
    localStorage.setItem(ROLE_KEY, 'admin')
    isAuthenticated.value = true
    userRole.value = 'admin'
    return 'admin'
  }
  if (password === BUYER_PASSWORD) {
    localStorage.setItem(SESSION_KEY, Date.now().toString())
    localStorage.setItem(ROLE_KEY, 'buyer')
    isAuthenticated.value = true
    userRole.value = 'buyer'
    return 'buyer'
  }
  return null
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(ROLE_KEY)
  isAuthenticated.value = false
  userRole.value = 'admin'
}
