// Real cover when the book has an image; otherwise a generated placeholder.
export default function BookCover({ book, className = '' }) {
  if (book.image) {
    return (
      <img
        className={`book-cover book-cover--image ${className}`}
        src={book.image}
        alt={`Обкладинка «${book.title}»`}
        loading="lazy"
      />
    );
  }

  const [bg, fg] = book.cover;
  return (
    <div
      className={`book-cover ${className}`}
      style={{ '--cover-bg': bg, '--cover-fg': fg }}
      role="img"
      aria-label={`Обкладинка «${book.title}»`}
    >
      <span className="book-cover-title">{book.title}</span>
      <span className="book-cover-author">{book.author}</span>
    </div>
  );
}
