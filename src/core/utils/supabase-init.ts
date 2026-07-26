import { supabase } from '@/services/supabase.client'

let ready = false
const pending: (() => void)[] = []

export async function waitForSupabase(): Promise<void> {
  if (ready) return
  if (pending.length > 0) {
    return new Promise(resolve => pending.push(resolve))
  }
  return new Promise(resolve => {
    pending.push(resolve)
    retry()
  })
}

async function retry(tries = 0): Promise<void> {
  try {
    const { error } = await supabase.from('tiendas').select('id').limit(1).maybeSingle()
    if (error && tries < 5) {
      await new Promise(r => setTimeout(r, 300 * (tries + 1)))
      return retry(tries + 1)
    }
  } catch {
    if (tries < 5) {
      await new Promise(r => setTimeout(r, 300 * (tries + 1)))
      return retry(tries + 1)
    }
  }
  ready = true
  for (const cb of pending) cb()
  pending.length = 0
}
