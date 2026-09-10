'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  display_name: string
  username: string | null
  role: string
  is_verified: boolean
}

export default function AccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user

      if (!user) {
        router.replace('/login')
        return
      }

      setEmail(user.email ?? '')
      const { data } = await supabase
        .from('profiles')
        .select('display_name, username, role, is_verified')
        .eq('id', user.id)
        .maybeSingle()

      setProfile(data)
      setLoading(false)
    }

    load()
  }, [router])

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return <main className="auth-page"><section className="auth-card"><p>Caricamento profilo…</p></section></main>

  return (
    <main className="auth-page">
      <section className="auth-card account-card">
        <div className="account-top">
          <Link href="/" className="brand auth-brand">Libriva<span>.</span></Link>
          <button className="ghost account-logout" onClick={logout}>Esci</button>
        </div>
        <p className="auth-kicker">IL TUO SPAZIO</p>
        <h1>{profile?.display_name || 'Il tuo account'}</h1>
        <p className="auth-copy">{email}</p>

        <div className="account-grid">
          <div><small>Profilo</small><strong>{profile?.username ? `@${profile.username}` : 'Da completare'}</strong></div>
          <div><small>Ruolo</small><strong>{profile?.role || 'lettore'}</strong></div>
          <div><small>Verifica</small><strong>{profile?.is_verified ? 'Verificato' : 'Non verificato'}</strong></div>
        </div>

        <div className="actions account-actions">
          <Link className="button" href="/publish">Pubblica un ebook</Link>
          <Link className="textlink" href="/">Torna alla home →</Link>
        </div>
      </section>
    </main>
  )
}
