import { Link, useLocation } from 'react-router-dom';
import BookCover from '../components/BookCover.jsx';

// Shown after checkout; the order number and a cover come from the checkout page via router state.
export default function OrderSuccess() {
  const { state } = useLocation();

  return (
    <div className="order-success">
      <div className="container order-success-inner">
        {state?.cover && (
          <div className="order-success-cover">
            <BookCover book={state.cover} />
          </div>
        )}
        <h1>Дякуємо за замовлення!</h1>
        <p>
          {state?.orderId ? (
            <>
              Ваше замовлення <strong>№{state.orderId}</strong> успішно оформлене.
            </>
          ) : (
            'Ваше замовлення успішно оформлене.'
          )}
          <br />
          Ми вже готуємо його до відправки.
        </p>
        <Link to="/catalog" className="btn-accent">
          Продовжити покупки
        </Link>
      </div>
    </div>
  );
}
