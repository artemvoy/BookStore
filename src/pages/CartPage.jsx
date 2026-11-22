import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getBooks, getCart, removeCartItem, updateCartItem } from '../api.js';
import BookCard from '../components/BookCard.jsx';
import BookCover from '../components/BookCover.jsx';
import CartSummary from '../components/CartSummary.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { CartIcon, ChevronRight, CloseIcon } from '../components/icons.jsx';
import useAuth from '../useAuth.js';

// Cart line from the API in the shape BookCover expects.
export const coverOf = (item) => ({
  title: item.bookTitle,
  author: item.authorFullName,
  image: item.coverImageUrl,
  cover: ['#2b1a3d', '#ff2e8a'],
});

function CartLine({ item, onQuantity, onRemove, busy }) {
  return (
    <li className="cart-line">
      <Link to={`/book/${item.bookId}`} className="cart-line-cover" tabIndex={-1} aria-hidden="true">
        <BookCover book={coverOf(item)} />
      </Link>
      <div className="cart-line-info">
        <div className="cart-line-title">
          <Link to={`/book/${item.bookId}`}>{item.bookTitle}</Link>
          <span className="coins-badge">x2 YOUкоїнів</span>
        </div>
        <p className="cart-line-author">{item.authorFullName}</p>
        <div className="quantity quantity--small" role="group" aria-label={`Кількість «${item.bookTitle}»`}>
          <button
            type="button"
            aria-label="Менше"
            disabled={busy || item.quantity <= 1}
            onClick={() => onQuantity(item, item.quantity - 1)}
          >
            −
          </button>
          <span aria-live="polite">{item.quantity}</span>
          <button
            type="button"
            aria-label="Більше"
            disabled={busy || item.quantity >= item.stockQuantity}
            onClick={() => onQuantity(item, item.quantity + 1)}
          >
            +
          </button>
        </div>
        {item.quantity > item.stockQuantity && (
          <p className="form-status form-status--error">На складі лише {item.stockQuantity} шт.</p>
        )}
      </div>
      <div className="cart-line-side">
        <button
          type="button"
          className="cart-line-remove"
          aria-label={`Видалити «${item.bookTitle}» з кошика`}
          disabled={busy}
          onClick={() => onRemove(item)}
        >
          <CloseIcon size={16} />
        </button>
        <strong className="cart-line-price">{item.price * item.quantity} грн</strong>
        {item.quantity > 1 && <span className="cart-line-unit">{item.price} грн / шт.</span>}
      </div>
    </li>
  );
}

export function EmptyCart({ signedOut = false }) {
  return (
    <div className="cart-empty">
      <span className="cart-empty-icon" aria-hidden="true">
        <CartIcon size={40} />
      </span>
      <h1>{signedOut ? 'Увійдіть, щоб побачити кошик' : 'Ваш кошик порожній'}</h1>
      <p>{signedOut ? 'Кошик зберігається у вашому акаунті.' : 'Додайте товари, щоб оформити замовлення.'}</p>
      {signedOut ? (
        <Link to="/sign-in" state={{ from: '/cart' }} className="btn-accent">
          Увійти
        </Link>
      ) : (
        <Link to="/catalog" className="btn-accent">
          До покупок
        </Link>
      )}
    </div>
  );
}

export default function CartPage() {
  const loggedIn = useAuth();
  const { refreshCart } = useOutletContext();
  const [items, setItems] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    getCart()
      .then(setItems)
      .catch((err) => {
        setItems([]);
        setError(err.message);
      });

  useEffect(() => {
    if (loggedIn) load();
    getBooks({ pageSize: 5 })
      .then((res) => setSuggested(res.items))
      .catch(() => {});
  }, [loggedIn]);

  const change = async (action) => {
    setBusy(true);
    setError('');
    try {
      await action();
      await load();
      refreshCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  let body;
  if (!loggedIn) body = <EmptyCart signedOut />;
  else if (!items) body = <p className="catalog-empty">Завантаження…</p>;
  else if (items.length === 0) body = <EmptyCart />;
  else
    body = (
      <div className="cart-layout">
        <section className="cart-panel">
          <h1 className="cart-panel-title">Товари</h1>
          {error && (
            <p className="form-status form-status--error" role="alert">
              {error}
            </p>
          )}
          <ul className="cart-lines">
            {items.map((item) => (
              <CartLine
                key={item.id}
                item={item}
                busy={busy}
                onQuantity={(i, q) => change(() => updateCartItem(i.id, q))}
                onRemove={(i) => change(() => removeCartItem(i.id))}
              />
            ))}
          </ul>
        </section>
        <CartSummary
          items={items}
          action={
            <Link to="/checkout" className="btn-accent btn-block">
              Оформити замовлення
            </Link>
          }
        />
      </div>
    );

  return (
    <div className="cart-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навігація">
          <Link to="/">Головна</Link>
          <ChevronRight size={14} />
          <span aria-current="page">Ваша корзина</span>
        </nav>
        {body}
      </div>

      {loggedIn && items?.length > 0 && suggested.length > 0 && (
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
