import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://lytntpuieqjccaplxyfm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dG50cHVpZXFqY2NhcGx4eWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NTg5NDAsImV4cCI6MjEwNDQzNDk0MH0.swZsjEgn8t-jwRvrG9tq--h_n2hnYVmAoI2I-94CBGE'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
