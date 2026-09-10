import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://lytntpuieqjccaplxyfm.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ylN6tllzhzXje_994dP9aw_l6Du_W4-'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
}
