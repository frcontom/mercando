import { useState, useEffect } from 'react'
import type { Signal } from '@preact/signals-react'

export function useSignalValue<T>(signal: Signal<T>): T {
  const [value, setValue] = useState(signal.value)
  useEffect(() => {
    setValue(signal.value)
    const unsub = signal.subscribe(setValue)
    return unsub
  }, [signal])
  return value
}
