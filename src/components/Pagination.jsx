import { ChevronRight } from './icons.jsx';

// Page numbers around the current one, with the first and last always shown: 1 … 4 5 6 … 12
function pageList(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['gap', p] : [p]));
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Сторінки">
      <button
        type="button"
        className="pagination-step pagination-step--prev"
        aria-label="Попередня сторінка"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronRight size={18} />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="pagination-gap">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`pagination-page${p === page ? ' is-active' : ''}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className="pagination-step"
        aria-label="Наступна сторінка"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
