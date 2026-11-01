import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import { ChevronDown, ChevronRight, CloseIcon, FilterIcon, RefreshIcon, SearchIcon } from '../components/icons.jsx';
import { BOOKS, CATEGORIES, FILTERS as GROUPS } from '../data/shop.js';

const PRICE_MIN = 0;
const PRICE_MAX = 10000;
const PAGE_SIZE = 12;
const SORTS = [
  { id: 'popular', label: 'За популярністю' },
  { id: 'cheap', label: 'Від дешевих' },
  { id: 'expensive', label: 'Від дорогих' },
  { id: 'new', label: 'Новинки' },
];

const emptyChecks = () => Object.fromEntries(GROUPS.map((g) => [g.key, []]));

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

function CheckboxGroup({ group, selected, onToggle }) {
  const [search, setSearch] = useState('');
  const options = group.options.filter((o) => String(o).toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <>
      {group.searchable && (
        <label className="filter-search">
          <SearchIcon size={14} />
          <input
            placeholder="Пошук"
            aria-label={`Пошук: ${group.title}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      )}
      <ul className={`filter-options${group.searchable ? ' filter-options--scroll' : ''}`}>
        {options.map((option) => (
          <li key={option}>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(group.key, option)}
              />
              {option}
            </label>
          </li>
        ))}
        {options.length === 0 && <li className="filter-empty">Нічого не знайдено</li>}
      </ul>
    </>
  );
}

function PriceFilter({ value, onApply }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const set = (i) => (e) => {
    const n = Math.min(PRICE_MAX, Math.max(PRICE_MIN, Number(e.target.value) || 0));
    setDraft((d) => (i === 0 ? [Math.min(n, d[1]), d[1]] : [d[0], Math.max(n, d[0])]));
  };

  const pct = (n) => ((n - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div className="price-filter">
      <div className="price-inputs">
        <label>
          Від
          <input type="number" min={PRICE_MIN} max={PRICE_MAX} value={draft[0]} onChange={set(0)} />
        </label>
        <label>
          До
          <input type="number" min={PRICE_MIN} max={PRICE_MAX} value={draft[1]} onChange={set(1)} />
        </label>
      </div>
      <div
        className="range"
        style={{ '--from': `${pct(draft[0])}%`, '--to': `${pct(draft[1])}%` }}
      >
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10}
          value={draft[0]}
          aria-label="Мінімальна ціна"
          onChange={set(0)}
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10}
          value={draft[1]}
          aria-label="Максимальна ціна"
          onChange={set(1)}
        />
      </div>
      <button type="button" className="btn-primary btn-block" onClick={() => onApply(draft)}>
        Застосувати
      </button>
    </div>
  );
}

function SortSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = SORTS.find((s) => s.id === value);
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
                aria-selected={s.id === value}
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
  const { slug = 'youth' } = useParams();
  const [params] = useSearchParams();
  const query = params.get('q')?.trim() ?? '';
  const category = CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[3];

  const [price, setPrice] = useState([PRICE_MIN, PRICE_MAX]);
  const [checks, setChecks] = useState(emptyChecks);
  const [sort, setSort] = useState('popular');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Start fresh whenever the user lands on another category or search.
  useEffect(() => {
    setPrice([PRICE_MIN, PRICE_MAX]);
    setChecks(emptyChecks());
    setVisible(PAGE_SIZE);
  }, [slug, query]);

  const toggle = (key, option) => {
    setChecks((c) => ({
      ...c,
      [key]: c[key].includes(option) ? c[key].filter((o) => o !== option) : [...c[key], option],
    }));
    setVisible(PAGE_SIZE);
  };

  const books = useMemo(() => {
    const q = query.toLowerCase();
    return BOOKS.filter((b) => !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }, [query]);

  const activeCount = Object.values(checks).flat().length + (price[0] > PRICE_MIN || price[1] < PRICE_MAX ? 1 : 0);
  const title = query ? `Пошук: «${query}»` : category.name;

  return (
    <div className="catalog-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навігація">
          <Link to="/">Головна</Link>
          <ChevronRight size={14} />
          <span aria-current="page">{title}</span>
        </nav>
        <h1 className="page-title">{title}</h1>

        {category.subcategories.length > 0 && !query && (
          <ul className="subcategories">
            {category.subcategories.map((sub, i) => (
              <li key={sub}>
                <a href="#" className="collection">
                  <span className={`collection-image collection-image--${i % 5}`} aria-hidden="true" />
                  {sub}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="catalog-layout">
          <aside className={`filters${filtersOpen ? ' is-open' : ''}`} aria-label="Фільтри">
            <div className="filters-head">
              <span>Фільтри</span>
              <button type="button" className="icon-btn" aria-label="Закрити фільтри" onClick={() => setFiltersOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <FilterSection title="Ціна">
              <PriceFilter
                value={price}
                onApply={(p) => {
                  setPrice(p);
                  setVisible(PAGE_SIZE);
                }}
              />
            </FilterSection>
            {GROUPS.map((group) => (
              <FilterSection key={group.key} title={group.title}>
                <CheckboxGroup group={group} selected={checks[group.key]} onToggle={toggle} />
              </FilterSection>
            ))}

            <div className="filters-foot">
              <button
                type="button"
                className="btn-outline-accent btn-block"
                onClick={() => {
                  setChecks(emptyChecks());
                  setPrice([PRICE_MIN, PRICE_MAX]);
                }}
              >
                Скинути
              </button>
              <button type="button" className="btn-primary btn-block" onClick={() => setFiltersOpen(false)}>
                Показати {books.length}
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
              <span className="catalog-count">Товарів: {books.length}</span>
              <SortSelect value={sort} onChange={setSort} />
            </div>

            {books.length === 0 ? (
              <p className="catalog-empty">За вашими фільтрами книг не знайдено.</p>
            ) : (
              <div className="catalog-grid">
                {books.slice(0, visible).map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}

            {visible < books.length && (
              <button type="button" className="btn-primary btn-more" onClick={() => setVisible((v) => v + 8)}>
                <RefreshIcon />
                Більше
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
