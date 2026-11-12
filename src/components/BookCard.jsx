import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import BookCover from './BookCover.jsx';
import { CartIcon, HeartIcon, StarIcon } from './icons.jsx';

export default function BookCard({ book }) {
  const { addToCart } = useOutletContext() ?? {};
  const [liked, setLiked] = useState(false);

  return (
    <article className="book-card">
      <div className="book-card-media">
        <span className="book-card-badge">x2 YOUкоїнів</span>
        <button
          type="button"
          className={`book-card-like${liked ? ' is-liked' : ''}`}
          aria-label={liked ? 'Прибрати з обраного' : 'Додати в обране'}
          aria-pressed={liked}
          onClick={() => setLiked((l) => !l)}
        >
          <HeartIcon size={16} />
        </button>
        <Link to={`/book/${book.id}`} tabIndex={-1} aria-hidden="true">
          <BookCover book={book} />
        </Link>
      </div>

      {book.rating && (
        <div className="book-card-meta">
          <span className="book-card-rating">
            <StarIcon /> {book.rating}
          </span>
          <span>{book.reviews} оцінки</span>
        </div>
      )}
      <h3 className="book-card-title">
        <Link to={`/book/${book.id}`}>{book.title}</Link>
      </h3>
      <p className="book-card-author">{book.author}</p>

      <div className="book-card-bottom">
        <div className="book-card-price">
          {book.oldPrice && <s>{book.oldPrice} грн</s>}
          <strong>{book.price} грн</strong>
        </div>
        <button
          type="button"
          className="book-card-cart"
          aria-label={`Додати «${book.title}» в кошик`}
          onClick={() => addToCart?.(book)}
        >
          <CartIcon size={18} />
        </button>
      </div>
    </article>
  );
}
