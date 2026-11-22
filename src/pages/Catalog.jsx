import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import Pagination from '../components/Pagination.jsx';
import { ChevronDown, ChevronRight, CloseIcon, FilterIcon, SearchIcon } from '../components/icons.jsx';
import { getAuthors, getBooks, getPriceRange } from '../api.js';
import useCategories from '../useCategories.js';

// Slider limits until the real cheapest/dearest prices arrive from the API.
const DEFAULT_BOUNDS = { min: 0, max: 10000 };
const PAGE_SIZE = 12;
// `sortBy` values understood by GET /api/books; without one it returns newest first.
const SORTS = [
  { id: 'new', label: 'Новинки' },
  { id: 'cheap', label: 'Від дешевих', sortBy: 'price_asc' },
  { id: 'expensive', label: 'Від дорогих', sortBy: 'price_desc' },
  { id: 'title', label: 'За назвою', sortBy: 'title' },
];

// Every filter lives in the URL (?q=&author=&min=&max=&sort=&page=) so links and the back button keep it.
const FILTER_KEYS = ['author', 'min', 'max'];

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`filter${open ? ' is-open' : ''}`}>
      <button type="button" className="filter-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {title}
        <ChevronDown />
      </button>
      {open && <div className="filter-body">{children}</div>}
    </div>
  );
}

function CategoryList({ categories, activeSlug, search }) {
  const suffix = search ? `?q=${encodeURIComponent(search)}` : '';
  return (
    <ul className="filter-options">
      <li>
        <Link to={`/catalog${suffix}`} className={`filter-link${activeSlug ? '' : ' is-active'}`}>
          Усі книги
        </Link>
      </li>
      {categories.map((c) => (
        <li key={c.slug}>
          <Link
            to={`/catalog/${c.slug}${suffix}`}
            className={`filter-link${c.slug === activeSlug ? ' is-active' : ''}`}
            aria-current={c.slug === activeSlug ? 'page' : undefined}
          >
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function AuthorFilter({ authors, selected, onSelect }) {
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const options = authors.filter((a) => a.name.toLowerCase().includes(term));

  return (
    <>
      <label className="filter-search">
        <SearchIcon size={14} />
        <input placeholder="Пошук" aria-label="Пошук автора" value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      <ul className="filter-options filter-options--scroll">
        <li>
          <label className="checkbox">
            <input type="radio" name="author" checked={!selected} onChange={() => onSelect('')} />
            Усі автори
          </label>
        </li>
        {options.map((a) => (
          <li key={a.id}>
            <label className="checkbox">
              <input
                type="radio"
                name="author"
                checked={selected === String(a.id)}
                onChange={() => onSelect(String(a.id))}
              />
              {a.name}
            </label>
          </li>
        ))}
        {options.length === 0 && <li className="filter-empty">Нічого не знайдено</li>}
      </ul>
    </>
  );
}

function PriceFilter({ value, bounds, onApply }) {
  const { min, max } = bounds;
  // Text the user is typing; it is clamped to the price range only on blur or apply.
  const [draft, setDraft] = useState(value.map(String));
  useEffect(() => setDraft(value.map(String)), [value[0], value[1]]);

  const clamp = (n) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
  const normalize = ([from, to]) => {
    const a = clamp(Number(from || min));
    const b = clamp(Number(to || max));
    return a <= b ? [a, b] : [b, a];
  };

  const [from, to] = normalize(draft);
  const pct = (n) => ((n - min) / (max - min || 1)) * 100;

  const type = (i) => (e) => setDraft((d) => (i === 0 ? [e.target.value, d[1]] : [d[0], e.target.value]));
  const slide = (i) => (e) => {
    const n = Number(e.target.value);
    setDraft(() => (i === 0 ? [String(Math.min(n, to)), String(to)] : [String(from), String(Math.max(n, from))]));
  };
  const tidy = () => setDraft(normalize(draft).map(String));

  return (
    <div className="price-filter">
      <div className="price-inputs">
        <label>
          Від
          <input type="number" min={min} max={max} value={draft[0]} onChange={type(0)} onBlur={tidy} />
        </label>
        <label>
          До
          <input type="number" min={min} max={max} value={draft[1]} onChange={type(1)} onBlur={tidy} />
        </label>
      </div>
      <div className="range" style={{ '--from': `${pct(from)}%`, '--to': `${pct(to)}%` }}>
        <input type="range" min={min} max={max} step={1} value={from} aria-label="Мінімальна ціна" onChange={slide(0)} />
        <input type="range" min={min} max={max} step={1} value={to} aria-label="Максимальна ціна" onChange={slide(1)} />
      </div>
      <p className="price-bounds">
        {min}–{max} грн
      </p>
      <button
        type="button"
        className="btn-primary btn-block"
        onClick={() => {
          tidy();
          onApply([from, to]);
        }}
      >
        Застосувати
      </button>
    </div>
  );
}

function SortSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = SORTS.find((s) => s.id === value) ?? SORTS[0];
  return (
    <div className="sort" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button type="button" className="sort-toggle" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {current.label}
        <ChevronDown />
      </button>
      {open && (
        <ul className="sort-menu" role="listbox">
          {SORTS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                role="option"
                aria-selected={s.id === current.id}
                onClick={() => {
                  onChange(s.id);
                  setOpen(false);
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Catalog() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const categories = useCategories();
  const category = categories.find((c) => c.slug === slug);
  // Only backend categories have numeric ids; anything else shows the whole catalog.
  const categoryId = /^\d+$/.test(slug ?? '') ? slug : undefined;

  const query = params.get('q')?.trim() ?? '';
  const authorId = params.get('author') ?? '';
  const [bounds, setBounds] = useState(DEFAULT_BOUNDS);
  const clamp = (n) => Math.min(bounds.max, Math.max(bounds.min, n));
  // Only a limit narrower than the real price range filters anything.
  const minPrice = clamp(Number(params.get('min')) || bounds.min);
  const maxPrice = clamp(Number(params.get('max')) || bounds.max);
  const sort = params.get('sort') ?? 'new';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [result, setResult] = useState({ items: [], totalItems: 0, totalPages: 0 });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getAuthors()
      .then((list) => setAuthors(list.map((a) => ({ id: a.id, name: `${a.firstName} ${a.lastName}`.trim() }))))
      .catch(() => setAuthors([]));
  }, []);

  // The slider spans the cheapest to the dearest book among the current category, author and search.
  useEffect(() => {
    let alive = true;
    getPriceRange({ categoryId, authorId, searchTerm: query })
      .then((range) => alive && range && setBounds(range))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [categoryId, authorId, query]);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    getBooks({
      categoryId,
      authorId,
      searchTerm: query,
      sortBy: SORTS.find((s) => s.id === sort)?.sortBy,
      minPrice: minPrice > bounds.min ? minPrice : undefined,
      maxPrice: maxPrice < bounds.max ? maxPrice : undefined,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((data) => {
        if (!alive) return;
        setResult(data);
        setStatus('ready');
      })
      .catch(() => alive && setStatus('error'));
    return () => {
      alive = false;
    };
  }, [categoryId, authorId, query, sort, minPrice, maxPrice, page]);

  // Changing any filter goes back to page 1; `null` removes the parameter.
  const setFilters = (changes) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([key, value]) => {
        if (value === null || value === '' || value === undefined) next.delete(key);
        else next.set(key, value);
      });
      if (!('page' in changes)) next.delete('page');
      return next;
    });
  };

  const goToPage = (p) => {
    setFilters({ page: p > 1 ? p : null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const priceActive = minPrice > bounds.min || maxPrice < bounds.max;
  const activeCount = (authorId ? 1 : 0) + (priceActive ? 1 : 0);
  const title = query ? `Пошук: «${query}»` : category?.name ?? 'Каталог';
  const { items: books, totalItems: total, totalPages } = result;

  return (
    <div className="catalog-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навігація">
          <Link to="/">Головна</Link>
          <ChevronRight size={14} />
          {query && category ? (
            <>
              <Link to={`/catalog/${category.slug}`}>{category.name}</Link>
              <ChevronRight size={14} />
            </>
          ) : null}
          <span aria-current="page">{title}</span>
        </nav>
        <h1 className="page-title">{title}</h1>

        <div className="catalog-layout">
          <aside className={`filters${filtersOpen ? ' is-open' : ''}`} aria-label="Фільтри">
            <div className="filters-head">
              <span>Фільтри</span>
              <button type="button" className="icon-btn" aria-label="Закрити фільтри" onClick={() => setFiltersOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <FilterSection title="Категорії">
              <CategoryList categories={categories.filter((c) => /^\d+$/.test(c.slug))} activeSlug={categoryId} search={query} />
            </FilterSection>
            <FilterSection title="Ціна">
              <PriceFilter
                value={[minPrice, maxPrice]}
                bounds={bounds}
                onApply={([min, max]) =>
                  setFilters({ min: min > bounds.min ? min : null, max: max < bounds.max ? max : null })
                }
              />
            </FilterSection>
            {authors.length > 0 && (
              <FilterSection title="Автор">
                <AuthorFilter authors={authors} selected={authorId} onSelect={(id) => setFilters({ author: id })} />
              </FilterSection>
            )}

            <div className="filters-foot">
              <button
                type="button"
                className="btn-outline-accent btn-block"
                onClick={() => setFilters(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])))}
              >
                Скинути
              </button>
              <button type="button" className="btn-primary btn-block" onClick={() => setFiltersOpen(false)}>
                Показати {total}
              </button>
            </div>
          </aside>
          {filtersOpen && <div className="filters-backdrop" onClick={() => setFiltersOpen(false)} />}

          <section className="catalog-results">
            <div className="catalog-toolbar">
              <button type="button" className="filters-open" onClick={() => setFiltersOpen(true)}>
                <FilterIcon />
                Фільтри{activeCount > 0 && ` (${activeCount})`}
              </button>
              <span className="catalog-count">Товарів: {total}</span>
              {activeCount > 0 && (
                <button
                  type="button"
                  className="filters-reset"
                  onClick={() => setFilters(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])))}
                >
                  Скинути фільтри
                </button>
              )}
              <SortSelect value={sort} onChange={(id) => setFilters({ sort: id === 'new' ? null : id })} />
            </div>

            {status === 'error' ? (
              <p className="catalog-empty">Не вдалося завантажити книги. Перевірте, чи запущений сервер.</p>
            ) : status === 'loading' && books.length === 0 ? (
              <p className="catalog-empty">Завантаження…</p>
            ) : books.length === 0 ? (
              <p className="catalog-empty">За вашими фільтрами книг не знайдено.</p>
            ) : (
              <div className={`catalog-grid${status === 'loading' ? ' is-loading' : ''}`}>
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </section>
        </div>
      </div>
    </div>
  );
}
