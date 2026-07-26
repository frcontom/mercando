import { signal } from '@preact/signals-react'

export const snackbarMessage = signal<string | null>(null)
export const snackbarOpen = signal(false)

export function showSnackbar(message: string): void {
  snackbarMessage.value = message
  snackbarOpen.value = true
}

export function hideSnackbar(): void {
  snackbarOpen.value = false
  snackbarMessage.value = null
}
