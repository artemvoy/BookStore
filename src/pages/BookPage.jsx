import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { getBook, getBooks } from '../api.js';
import BookCard from '../components/BookCard.jsx';
import BookCover from '../components/BookCover.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { CartIcon, ChevronRight } from '../components/icons.jsx';

function QuantityInput({ value, max, onChange }) {
  return (
    <div className="quantity" role="group" aria-label="Кількість">
      <button type="button" aria-label="Менше" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Більше" disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

export default function BookPage() {
  const { id } = useParams();
  const { addToCart } = useOutletContext();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading');
  const [quantity, setQuantity] = useState(1);
  const [cartStatus, setCartStatus] = useState(null);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    setQuantity(1);
    setCartStatus(null);
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

  const inStock = book.stock > 0;

  const handleAdd = async () => {
    setCartStatus({ type: 'pending' });
    const ok = await addToCart(book, quantity);
    setCartStatus(ok ? { type: 'ok', text: `Додано в кошик: ${quantity} шт.` } : null);
  };

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
          <div className="book-detail-cover">
            <BookCover book={book} className="book-cover--detail" />
          </div>

          <div className="book-detail-info">
            <h1 className="book-detail-title">{book.title}</h1>
            {book.author && (
              <Link className="book-detail-author" to={`/catalog?author=${book.authorId}`}>
                {book.author}
              </Link>
            )}

            <dl className="book-detail-props">
              {book.category && (
                <>
                  <dt>Категорія</dt>
                  <dd>
                    <Link to={`/catalog/${book.categoryId}`}>{book.category}</Link>
                  </dd>
                </>
              )}
              <dt>Наявність</dt>
              <dd className={inStock ? 'in-stock' : 'out-of-stock'}>
                {inStock ? `В наявності (${book.stock} шт.)` : 'Немає в наявності'}
              </dd>
            </dl>

            <div className="book-buy">
              <strong className="book-buy-price">{book.price} грн</strong>
              {inStock && <QuantityInput value={quantity} max={book.stock} onChange={setQuantity} />}
              <button
                type="button"
                className="btn-accent book-buy-button"
                disabled={!inStock || cartStatus?.type === 'pending'}
                onClick={handleAdd}
              >
                <CartIcon size={18} />
                {cartStatus?.type === 'pending' ? 'Додаємо…' : 'Додати в кошик'}
              </button>
              {cartStatus?.text && (
                <p className="form-status form-status--ok" role="status">
                  {cartStatus.text}
                </p>
              )}
            </div>

            {book.description && (
              <section className="book-description">
                <h2>Опис</h2>
                <p>{book.description}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader title="Схожі книги" to={`/catalog/${book.categoryId}`} />
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
