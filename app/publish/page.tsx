'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

async function sha256(file: File) {
  const buffer = await file.arrayBuffer()
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function extension(name: string) {
  return name.split('.').pop()?.toLowerCase() || ''
}

export default function PublishPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setProgress('Controllo account…')

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
    const cover = form.get('cover') as File | null
    const manuscript = form.get('manuscript') as File | null

    if (!title || !description || !rights || !Number.isFinite(price) || price < 0 || !cover?.size || !manuscript?.size) {
      setError('Compila tutti i campi obbligatori, aggiungi copertina e ebook e conferma i diritti di pubblicazione.')
      setLoading(false); setProgress(''); return
    }

    const coverExt = extension(cover.name)
    const bookExt = extension(manuscript.name)
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(coverExt)) {
      setError('La copertina deve essere JPG, PNG o WEBP.')
      setLoading(false); setProgress(''); return
    }
    if (!['pdf', 'epub'].includes(bookExt)) {
      setError('Il file del libro deve essere PDF oppure EPUB.')
      setLoading(false); setProgress(''); return
    }
    if (cover.size > 10 * 1024 * 1024) {
      setError('La copertina supera il limite di 10 MB.')
      setLoading(false); setProgress(''); return
    }
    if (manuscript.size > 500 * 1024 * 1024) {
      setError('Il file del libro supera il limite di 500 MB.')
      setLoading(false); setProgress(''); return
    }

    const slugBase = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ebook'
    const slug = `${slugBase}-${Date.now().toString(36)}`

    setProgress('Creo la scheda del libro…')
    const { data: book, error: bookError } = await supabase.from('books').insert({
      author_id: user.id, slug, title, subtitle: subtitle || null, description,
      category: category || null, language, status: 'draft',
      rights_confirmed_at: new Date().toISOString()
    }).select('id').single()
    if (bookError || !book) { setError(bookError?.message || 'Impossibile creare il libro.'); setLoading(false); setProgress(''); return }

    const amountCents = Math.round(price * 100)
    const { error: priceError } = await supabase.from('book_prices').insert({ book_id: book.id, amount_cents: amountCents, currency: 'EUR', active: true })
    if (priceError) { setError(`Libro creato, ma prezzo non salvato: ${priceError.message}`); setLoading(false); setProgress(''); return }

    const coverPath = `${user.id}/${book.id}/cover.${coverExt === 'jpeg' ? 'jpg' : coverExt}`
    const manuscriptPath = `${user.id}/${book.id}/manuscript.${bookExt}`

    setProgress('Carico la copertina…')
    const { error: coverError } = await supabase.storage.from('book-covers').upload(coverPath, cover, { upsert: false, contentType: cover.type })
    if (coverError) { setError(`Errore copertina: ${coverError.message}`); setLoading(false); setProgress(''); return }

    setProgress('Calcolo l’impronta digitale del file…')
    const digest = await sha256(manuscript)

    setProgress('Carico il manoscritto…')
    const { error: uploadError } = await supabase.storage.from('book-files').upload(manuscriptPath, manuscript, { upsert: false, contentType: manuscript.type || (bookExt === 'pdf' ? 'application/pdf' : 'application/epub+zip') })
    if (uploadError) { setError(`Errore ebook: ${uploadError.message}`); setLoading(false); setProgress(''); return }

    setProgress('Registro il file…')
    const { data: fileRow, error: fileError } = await supabase.from('book_files').insert({
      book_id: book.id,
      version: 1,
      format: bookExt,
      storage_path: manuscriptPath,
      sha256: digest,
      file_size_bytes: manuscript.size,
      original_filename: manuscript.name,
      mime_type: manuscript.type || null,
      upload_status: 'uploaded',
      security_status: 'pending'
    }).select('id').single()
    if (fileError || !fileRow) { setError(fileError?.message || 'File caricato ma non registrato.'); setLoading(false); setProgress(''); return }

    const { error: updateError } = await supabase.from('books').update({ cover_path: coverPath, current_file_id: fileRow.id }).eq('id', book.id)
    if (updateError) { setError(`File caricati, ma scheda non aggiornata: ${updateError.message}`); setLoading(false); setProgress(''); return }

    setProgress('Ebook salvato come bozza ✓')
    setTimeout(() => { router.push('/account'); router.refresh() }, 700)
  }

  return <main className="auth-page"><section className="auth-card publish-card">
    <a className="brand auth-brand" href="/">Libriva<span>.</span></a>
    <p className="auth-kicker">AREA AUTORE</p>
    <h1>Pubblica il tuo ebook</h1>
    <p className="auth-copy">Inserisci i dati, carica copertina e manoscritto. Salveremo tutto come bozza prima della revisione.</p>
    <form onSubmit={submit} className="auth-form">
      <label>Titolo *<input name="title" required placeholder="Titolo dell’ebook" /></label>
      <label>Sottotitolo<input name="subtitle" placeholder="Facoltativo" /></label>
      <label>Descrizione *<textarea name="description" required rows={6} placeholder="Racconta ai lettori di cosa parla il libro" /></label>
      <label>Categoria<input name="category" placeholder="Es. Storia, Romanzo, Sport" /></label>
      <label>Lingua<select name="language" defaultValue="it"><option value="it">Italiano</option><option value="en">Inglese</option><option value="es">Spagnolo</option><option value="fr">Francese</option></select></label>
      <label>Prezzo (€) *<input name="price" inputMode="decimal" defaultValue="4,99" required /></label>
      <label>Copertina *<input name="cover" type="file" accept="image/jpeg,image/png,image/webp" required /><small className="field-help">JPG, PNG o WEBP. Massimo 10 MB.</small></label>
      <label>File ebook *<input name="manuscript" type="file" accept="application/pdf,.pdf,application/epub+zip,.epub" required /><small className="field-help">PDF o EPUB. Massimo 500 MB.</small></label>
      <label className="rights-check"><input type="checkbox" name="rights" required /> <span>Confermo di possedere i diritti necessari per pubblicare e vendere quest’opera su Libriva.</span></label>
      {progress && <div className="auth-success">{progress}</div>}
      {error && <div className="auth-error">{error}</div>}
      <button className="button auth-submit" type="submit" disabled={loading}>{loading ? 'Caricamento in corso…' : 'Salva ebook come bozza'}</button>
    </form>
    <a className="textlink" href="/account">← Torna al mio spazio</a>
  </section></main>
}
