'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      window.location.href = '/account'
      return
    }

    setMessage('Registrazione completata. Controlla la tua email per confermare l’account.')
    setLoading(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="brand auth-brand">Libriva<span>.</span></Link>
        <p className="auth-kicker">ENTRA NELLA COMMUNITY</p>
        <h1>Crea il tuo account</h1>
        <p className="auth-copy">Inizia come lettore e, quando vuoi, pubblica le tue opere.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Nome<input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" /></label>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" minLength={6} /></label>
          {message && <div className="auth-success">{message}</div>}
          {error && <div className="auth-error">{error}</div>}
          <button className="button auth-submit" type="submit" disabled={loading}>{loading ? 'Creazione account…' : 'Registrati'}</button>
        </form>

        <p className="auth-switch">Hai già un account? <Link href="/login">Accedi</Link></p>
      </section>
    </main>
  )
}
