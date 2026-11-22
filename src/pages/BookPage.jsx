import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { coinsFor, getAuthor, getBook, getBooks } from '../api.js';
import AuthorPhoto from '../components/AuthorPhoto.jsx';
import BookCard from '../components/BookCard.jsx';
import BookCover from '../components/BookCover.jsx';
import Reviews from '../components/Reviews.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import Stars from '../components/Stars.jsx';
import { ChevronRight, HeartIcon } from '../components/icons.jsx';

function BuyBox({ book }) {
  const { addToCart } = useOutletContext();
  const [liked, setLiked] = useState(false);
  const [status, setStatus] = useState(null);
  const inStock = book.stock > 0;

  useEffect(() => {
    setStatus(null);
  }, [book.id]);

  const handleAdd = async () => {
    setStatus('pending');
    setStatus((await addToCart(book, 1)) ? 'added' : null);
  };

  return (
    <aside className="buy-box">
      <div className="buy-box-top">
        <span className={`stock-badge${inStock ? '' : ' stock-badge--out'}`}>
          {inStock ? 'Є в наявності ✓' : 'Немає в наявності'}
        </span>
        <button
          type="button"
          className={`buy-box-like${liked ? ' is-liked' : ''}`}
          aria-label={liked ? 'Прибрати з обраного' : 'Додати в обране'}
          aria-pressed={liked}
          onClick={() => setLiked((l) => !l)}
        >
          <HeartIcon size={18} />
        </button>
      </div>
      <p className="coins-note">
        На ваш рахунок буде нараховано <strong>+{coinsFor(1)} YOUкоїнів</strong>
      </p>
      <div className="buy-box-price">
        <span>Ціна:</span>
        <strong>{book.price} грн</strong>
      </div>
      <button
        type="button"
        className="btn-accent btn-block buy-box-button"
        disabled={!inStock || status === 'pending'}
        onClick={handleAdd}
      >
        {status === 'pending' ? 'Додаємо…' : 'Додати у кошик'}
      </button>
      {status === 'added' && (
        <p className="form-status form-status--ok" role="status">
          Додано в кошик. <Link to="/cart">Перейти до кошика</Link>
        </p>
      )}
      <dl className="buy-box-info">
        <div>
          <dt>Доставка</dt>
          <dd>Від 0 грн</dd>
        </div>
        <div>
          <dt>Оплата</dt>
          <dd>Післяплата карткою</dd>
        </div>
      </dl>
    </aside>
  );
}

function AboutAuthor({ book }) {
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState({ items: [], totalItems: 0 });

  useEffect(() => {
    let alive = true;
    getAuthor(book.authorId)
      .then((a) => alive && setAuthor(a))
      .catch(() => {});
    getBooks({ authorId: book.authorId, pageSize: 3 })
      .then((res) => alive && setBooks(res))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [book.authorId]);

  if (!author) return null;
  const name = `${author.firstName} ${author.lastName}`;

  return (
    <section className="about-author">
      <h2 className="about-author-tab">Про автора</h2>
      <div className="about-author-card">
        <div className="about-author-head">
          <AuthorPhoto author={author} className="about-author-photo" />
          <div className="about-author-text">
            <div className="about-author-row">
              <h3>{name}</h3>
              <Link to={`/author/${author.id}`} className="btn-outline-light">
                Дізнатись більше <ChevronRight size={14} />
              </Link>
            </div>
            <p className="about-author-bio">{author.bio || 'Біографія автора з’явиться згодом.'}</p>
          </div>
        </div>
        {books.items.length > 0 && (
          <>
            <p className="about-author-count">Книги цього автора ({books.totalItems})</p>
            <div className="about-author-books">
              {books.items.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function BookPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus((s) => (book?.id === Number(id) ? s : 'loading'));
    getBook(id)
      .then((data) => {
        if (!alive) return;
        setBook(data);
        setStatus('ready');
        return getBooks({ categoryId: data.categoryId, pageSize: 6 }).then(
          (res) => alive && setRelated(res.items.filter((b) => b.id !== data.id).slice(0, 5))
        );
      })
      .catch((err) => alive && setStatus(err.status === 404 ? 'missing' : 'error'));
    return () => {
      alive = false;
    };
  }, [id, reload]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (status !== 'ready') {
    const message = {
      loading: 'Завантаження…',
      missing: 'Книгу не знайдено.',
      error: 'Не вдалося завантажити книгу. Перевірте, чи запущений сервер.',
    }[status];
    return (
      <div className="book-page">
        <div className="container">
          <p className="catalog-empty">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навігація">
          <Link to="/">Головна</Link>
          <ChevronRight size={14} />
          {book.category && (
            <>
              <Link to={`/catalog/${book.categoryId}`}>{book.category}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span aria-current="page">{book.title}</span>
        </nav>

        <div className="book-detail">
          <div className="book-gallery">
            <div className="book-gallery-thumbs">
              <span className="book-gallery-thumb is-active">
                <BookCover book={book} />
              </span>
            </div>
            <div className="book-gallery-main">
              <BookCover book={book} className="book-cover--detail" />
            </div>
          </div>

          <div className="book-detail-info">
            <h1 className="book-detail-title">{book.title}</h1>
            <Link className="book-detail-author" to={`/author/${book.authorId}`}>
              {book.author}
            </Link>
            <a className="book-detail-rating" href="#reviews">
              <Stars value={Number(book.rating) || 0} />
              {book.reviews ? `${book.rating}/5` : 'Ще немає оцінок'}
            </a>

            <dl className="book-specs">
              <div>
                <dt>Автор</dt>
                <dd>
                  <Link to={`/author/${book.authorId}`}>{book.author}</Link>
                </dd>
              </div>
              <div>
                <dt>Категорія</dt>
                <dd>
                  <Link to={`/catalog/${book.categoryId}`}>{book.category}</Link>
                </dd>
              </div>
              <div>
                <dt>Тип товару</dt>
                <dd>Паперова книжка</dd>
              </div>
              <div>
                <dt>На складі</dt>
                <dd>{book.stock > 0 ? `${book.stock} шт.` : 'немає'}</dd>
              </div>
              <div>
                <dt>Відгуків</dt>
                <dd>{book.reviews}</dd>
              </div>
            </dl>
          </div>

          <BuyBox book={book} />
        </div>

        {book.description && (
          <section className="annotation">
            <h2>Анотація</h2>
            <p>{book.description}</p>
          </section>
        )}

        <AboutAuthor book={book} />

        <Reviews bookId={book.id} onChange={() => setReload((r) => r + 1)} />
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader title="Вам може сподобатись" to={`/catalog/${book.categoryId}`} />
            <div className="book-row">
              {related.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
