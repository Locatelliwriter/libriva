'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PublishPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const title = String(form.get('title') || '').trim()
    const subtitle = String(form.get('subtitle') || '').trim()
    const description = String(form.get('description') || '').trim()
    const category = String(form.get('category') || '').trim()
    const language = String(form.get('language') || 'it')
    const price = Number(String(form.get('price') || '0').replace(',', '.'))
    const rights = form.get('rights') === 'on'
    if (!title || !description || !rights || !Number.isFinite(price) || price < 0) {
      setError('Compila i campi obbligatori e conferma di possedere i diritti di pubblicazione.')
      setLoading(false); return
    }

    const slugBase = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ebook'
    const slug = `${slugBase}-${Date.now().toString(36)}`
    const { data: book, error: bookError } = await supabase.from('books').insert({
      author_id: user.id, slug, title, subtitle: subtitle || null, description,
      category: category || null, language, status: 'draft',
      rights_confirmed_at: new Date().toISOString()
    }).select('id').single()
    if (bookError || !book) { setError(bookError?.message || 'Impossibile creare il libro.'); setLoading(false); return }

    const amountCents = Math.round(price * 100)
    const { error: priceError } = await supabase.from('book_prices').insert({ book_id: book.id, amount_cents: amountCents, currency: 'EUR', active: true })
    if (priceError) { setError(`Libro creato, ma prezzo non salvato: ${priceError.message}`); setLoading(false); return }

    router.push('/account')
    router.refresh()
  }

  return <main className="auth-shell"><section className="auth-card publish-card">
    <a className="brand" href="/">Libriva<span>.</span></a>
    <p className="eyebrow">AREA AUTORE</p>
    <h1>Pubblica il tuo ebook</h1>
    <p className="auth-intro">Crea la scheda del libro. Il manoscritto e la copertina verranno aggiunti nel passaggio successivo.</p>
    <form onSubmit={submit} className="auth-form">
      <label>Titolo *<input name="title" required placeholder="Titolo dell’ebook" /></label>
      <label>Sottotitolo<input name="subtitle" placeholder="Facoltativo" /></label>
      <label>Descrizione *<textarea name="description" required rows={6} placeholder="Racconta ai lettori di cosa parla il libro" /></label>
      <label>Categoria<input name="category" placeholder="Es. Storia, Romanzo, Sport" /></label>
      <label>Lingua<select name="language" defaultValue="it"><option value="it">Italiano</option><option value="en">Inglese</option><option value="es">Spagnolo</option><option value="fr">Francese</option></select></label>
      <label>Prezzo (€) *<input name="price" inputMode="decimal" defaultValue="4,99" required /></label>
      <label className="rights-check"><input type="checkbox" name="rights" required /> Confermo di possedere i diritti necessari per pubblicare e vendere quest’opera su Libriva.</label>
      {error && <div className="auth-error">{error}</div>}
      <button className="primary auth-submit" disabled={loading}>{loading ? 'Salvataggio…' : 'Salva e continua'}</button>
    </form>
    <a className="back-link" href="/account">← Torna al mio spazio</a>
  </section></main>
}
