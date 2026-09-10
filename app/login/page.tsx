'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(searchParams.get('confirmed') ? 'Email confermata. Ora puoi accedere.' : '')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/account')
    router.refresh()
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="brand auth-brand">Libriva<span>.</span></Link>
        <p className="auth-kicker">BENTORNATO</p>
        <h1>Accedi a Libriva</h1>
        <p className="auth-copy">Ritrova la tua libreria, il tuo profilo e i tuoi libri.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" minLength={6} /></label>
          {message && <div className="auth-success">{message}</div>}
          {error && <div className="auth-error">{error}</div>}
          <button className="button auth-submit" type="submit" disabled={loading}>{loading ? 'Accesso in corso…' : 'Accedi'}</button>
        </form>

        <p className="auth-switch">Non hai ancora un account? <Link href="/signup">Registrati</Link></p>
      </section>
    </main>
  )
}
