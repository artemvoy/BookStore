import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import assetUrl from '../assetUrl.js';
import BookCover from '../components/BookCover.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { ChevronRight, PlusIcon } from '../components/icons.jsx';
import { getBooks } from '../api.js';
import { BANNER_BOOKS, COLLECTIONS, FAQ, HERO_SLIDES, PROMOS } from '../data/shop.js';

function Hero() {
  const [index, setIndex] = useState(0);
  const slide = HERO_SLIDES[index];

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(timer);
  }, [index]);

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-card">
          <div className="hero-copy">
            <h1 className="hero-title">
              <span className="hero-accent">{slide.accent}</span> {slide.title}
            </h1>
            <p className="hero-text">{slide.text}</p>
            <Link to="/catalog" className="btn-outline-accent">
              Більше
            </Link>
          </div>
          <div className="hero-image" aria-hidden="true" />
          <div className="hero-dots" role="tablist" aria-label="Слайди">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.accent}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Слайд ${i + 1}`}
                className={i === index ? 'is-active' : undefined}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BookRow({ title, books, glow = false }) {
  if (books.length === 0) return null;
  return (
    <section className={`section${glow ? ' section--glow' : ''}`}>
      <div className="container">
        <SectionHeader title={title} />
        <div className="book-row">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RomanceBanner() {
  return (
    <section className="section">
      <div className="container">
        <div className="feature-banner feature-banner--romance">
          <h2 className="feature-title">Романи — книги, які змушують серце битися частіше</h2>
          <div className="feature-books">
            <img src={assetUrl('/books/romance-banner.png')} alt="Ліз Томфорд — «Підіграй мені» та «Вище неба»" />
            {/* Sits exactly over the button drawn into the image so it stays clickable. */}
            <Link to="/catalog/adult" className="pill-light">
              Усі добірки <ChevronRight size={14} />
            </Link>
          </div>
          <ol className="feature-list">
            <li>Сучасна романтична історія з напруженням і пристрастю.</li>
            <li>Атмосфера великого міста та яскравий стиль обкладинки.</li>
            <li>Авторка — популярна серед фанатів динамічних любовних романів.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}

function Collections() {
  return (
    <section className="section section--white">
      <div className="container">
        <SectionHeader title="Добірки книг" />
        <ul className="collections">
          {COLLECTIONS.map((c) => (
            <li key={c.name}>
              <Link to="/catalog" className="collection">
                <span className="collection-image" style={{ background: c.color }} aria-hidden="true" />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Promos() {
  return (
    <section className="section section--tight">
      <div className="container promos">
        {PROMOS.map((p) => (
          <article key={p.title} className="promo">
            <div className="promo-image" aria-hidden="true" />
            <h3 className="promo-title">{p.title}</h3>
            <p className="promo-text">{p.text}</p>
            <a href="#" className="btn-outline-accent btn-block">
              Детальніше <ChevronRight size={14} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function NewYear({ books }) {
  if (books.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <SectionHeader title="Новорічні" />
        <div className="book-row book-row--featured">
          <div className="featured-image" aria-hidden="true" />
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthorBanner() {
  return (
    <section className="section">
      <div className="container">
        <div className="feature-banner feature-banner--author">
          <div>
            <p className="feature-kicker">У продажу з 15 серпня</p>
            <h2 className="feature-title">«Останній лист» про любов, що живе попри все</h2>
            <div className="author-quote">
              <img className="author-avatar" src={assetUrl('/authors/rebecca-yarros.png')} alt="" />
              <div>
                <p>Привіт, я Ребекка Яррос.</p>
                <p>
                  Для мене ця книга — особлива. Вона про те, що ми залишаємо після себе… і про
                  кохання, яке не знає меж часу.
                </p>
              </div>
            </div>
          </div>
          <BookCover book={BANNER_BOOKS.author} className="book-cover--hero" />
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(null);
  return (
    <section className="section section--glow">
      <div className="container faq">
        <h2 className="faq-title">Твоя історія</h2>
        <p className="faq-text">
          Історія починається тут. Книги, які змінюють погляди та надихають кожного дня. Зазирни до
          нас і знайди свою нову історію.
        </p>
        <div className="faq-list">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {item.q}
                  <PlusIcon />
                </button>
                {isOpen && <p className="faq-answer">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  // One request fills every row on the page; the API's default order is newest first.
  const [books, setBooks] = useState([]);

  useEffect(() => {
    getBooks({ pageSize: 18 })
      .then((data) => setBooks(data.items))
      .catch(() => setBooks([]));
  }, []);

  return (
    <>
      <Hero />
      <BookRow title="Новинки" books={books.slice(0, 5)} glow />
      <RomanceBanner />
      <Collections />
      <Promos />
      <BookRow title="Хіт продажу" books={books.slice(5, 10)} />
      <NewYear books={books.slice(15, 18)} />
      <AuthorBanner />
      <BookRow title="Анонси" books={books.slice(10, 15)} />
      <Faq />
    </>
  );
}
