import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAuthor, getBooks } from '../api.js';
import AuthorPhoto from '../components/AuthorPhoto.jsx';
import BookCard from '../components/BookCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { ChevronRight } from '../components/icons.jsx';

// Long biographies start folded to a few lines; the toggle shows the rest.
const FOLD_AT = 600;

export default function AuthorPage() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [status, setStatus] = useState('loading');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    setExpanded(false);
    window.scrollTo(0, 0);
    Promise.all([getAuthor(id), getBooks({ authorId: id, pageSize: 5 }), getBooks({ pageSize: 10 })])
      .then(([a, own, latest]) => {
        if (!alive) return;
        setAuthor(a);
        setBooks(own.items);
        setSuggested(latest.items.filter((b) => b.authorId !== a.id).slice(0, 5));
        setStatus('ready');
      })
      .catch((err) => alive && setStatus(err.status === 404 ? 'missing' : 'error'));
    return () => {
      alive = false;
    };
  }, [id]);

  if (status !== 'ready') {
    const message = {
      loading: 'Завантаження…',
      missing: 'Автора не знайдено.',
      error: 'Не вдалося завантажити сторінку автора.',
    }[status];
    return (
      <div className="author-page">
        <div className="container">
          <p className="catalog-empty">{message}</p>
        </div>
      </div>
    );
  }

  const name = `${author.firstName} ${author.lastName}`;
  const bio = author.bio || 'Біографія автора з’явиться згодом.';
  const foldable = bio.length > FOLD_AT;

  return (
    <div className="author-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навігація">
          <Link to="/">Головна</Link>
          <ChevronRight size={14} />
          <Link to="/catalog">Автори</Link>
          <ChevronRight size={14} />
          <span aria-current="page">{name}</span>
        </nav>

        <section className="author-hero">
          <AuthorPhoto author={author} className="author-hero-photo" />
          <div className="author-hero-text">
            <h1>{name}</h1>
            <div className={`author-hero-bio${foldable && !expanded ? ' is-folded' : ''}`}>{bio}</div>
            {foldable && (
              <button type="button" className="author-hero-toggle" onClick={() => setExpanded((e) => !e)}>
                {expanded ? 'Згорнути' : 'Читати повністю'}
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="section">
        <div className="container">
          <SectionHeader title="Книги цього автора" to={`/catalog?author=${author.id}`} linkLabel="Усі книги" />
          {books.length > 0 ? (
            <div className="book-row">
              {books.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          ) : (
            <p className="catalog-empty">Книг цього автора поки немає.</p>
          )}
        </div>
      </section>

      {suggested.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader title="Вам може сподобатись" />
            <div className="book-row">
              {suggested.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
