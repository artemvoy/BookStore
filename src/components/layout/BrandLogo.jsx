import { Link } from 'react-router-dom';

// "ЧитаYou" mark: owl peeking over an open red book.
export default function BrandLogo({ light = false }) {
  const owl = light ? '#ffffff' : 'var(--color-primary)';
  const eye = light ? 'var(--color-primary)' : '#ffffff';
  return (
    <Link to="/" className={`brand${light ? ' brand--light' : ''}`} aria-label="ЧитаYou — на головну">
      <svg width="44" height="38" viewBox="0 0 44 38" aria-hidden="true">
        <path d="M6 4c5-3 10-1 16 3 6-4 11-6 16-3-5 1-10 4-16 9C16 8 11 5 6 4Z" fill={owl} />
        <circle cx="15" cy="13" r="6" fill={owl} />
        <circle cx="29" cy="13" r="6" fill={owl} />
        <circle cx="15" cy="13" r="3.6" fill={eye} />
        <circle cx="29" cy="13" r="3.6" fill={eye} />
        <circle cx="15.6" cy="13.6" r="1.8" fill={owl} />
        <circle cx="28.4" cy="13.6" r="1.8" fill={owl} />
        <path d="M2 19c7-2 14-1 20 3v15c-6-4-13-5-20-3Z" fill="#ef4136" />
        <path d="M42 19c-7-2-14-1-20 3v15c6-4 13-5 20-3Z" fill="#d7322a" />
      </svg>
      <span className="brand-name">ЧитаYou</span>
    </Link>
  );
}
