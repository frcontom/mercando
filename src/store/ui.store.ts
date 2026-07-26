import { signal } from '@preact/signals-react'

export const snackbarMessage = signal<string | null>(null)
export const snackbarOpen = signal(false)
export const fabVisible = signal(false)
export const fabAction = signal<(() => void) | null>(null)

export function showSnackbar(message: string): void {
  snackbarMessage.value = message
  snackbarOpen.value = true
}

export function hideSnackbar(): void {
  snackbarOpen.value = false
  snackbarMessage.value = null
}

export function showFab(onClick: () => void): void {
  fabAction.value = onClick
  fabVisible.value = true
}

export function hideFab(): void {
  fabVisible.value = false
  fabAction.value = null
}
