import Link from 'next/link'

const books = [
  { title: 'Storie che meritano spazio', author: 'Autori indipendenti', price: 'da €2,99', icon: '📚' },
  { title: 'Leggi. Scopri. Sostieni.', author: 'Una libreria più libera', price: 'ebook digitali', icon: '✨' },
  { title: 'La tua prossima storia', author: 'Potrebbe essere qui', price: 'scoprila', icon: '📖' },
]

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <Link href="/" className="brand">Libriva<span>.</span></Link>
        <div className="navlinks">
          <a href="#scopri">Scopri</a>
          <a href="#come-funziona">Come funziona</a>
          <Link className="ghost" href="/login">Accedi</Link>
          <Link className="button small" href="/signup">Pubblica un ebook</Link>
        </div>
      </nav>

      <section className="hero shell">
        <div className="eyebrow">IL MARKETPLACE DEGLI AUTORI INDIPENDENTI</div>
        <h1>Le storie trovano<br/><em>la loro libertà.</em></h1>
        <p>Scopri ebook originali, sostieni direttamente chi scrive e porta i tuoi libri davanti a nuovi lettori.</p>
        <div className="actions">
          <a className="button" href="#scopri">Esplora Libriva</a>
          <Link className="textlink" href="/signup">Sono un autore →</Link>
        </div>
      </section>

      <section id="scopri" className="books shell">
        {books.map((book) => (
          <article className="book" key={book.title}>
            <div className="cover"><span>{book.icon}</span><b>LIBRIVA</b></div>
            <div><small>{book.author}</small><h3>{book.title}</h3><strong>{book.price}</strong></div>
          </article>
        ))}
      </section>

      <section id="come-funziona" className="manifesto shell">
        <div><span>01</span><h2>Pubblica</h2><p>Carica la tua opera digitale e crea una pagina pronta per incontrare i lettori.</p></div>
        <div><span>02</span><h2>Scopri</h2><p>Una vetrina dedicata a libri e autori che meritano di essere trovati.</p></div>
        <div><span>03</span><h2>Leggi</h2><p>Acquista in modo semplice e costruisci la tua libreria digitale personale.</p></div>
      </section>

      <footer className="shell footer"><b>Libriva.</b><span>Libri indipendenti, senza scaffali stretti.</span></footer>
    </main>
  )
}
