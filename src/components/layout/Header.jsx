import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import { NAV_LINKS } from '../../data/shop.js';
import useAuth from '../../useAuth.js';
import useProfile from '../../useProfile.js';
import useCategories from '../../useCategories.js';
import { CartIcon, ChevronRight, HeartIcon, MenuIcon, PhoneIcon, SearchIcon, UserIcon } from '../icons.jsx';

function CatalogMenu({ onClose }) {
  const categories = useCategories();
  const [activeSlug, setActiveSlug] = useState(null);
  const active = categories.find((c) => c.slug === activeSlug) ?? categories[0];

  return (
    <div className="catalog-menu" role="menu">
      <ul className="catalog-menu-list">
        {categories.map((cat) => (
          <li key={cat.slug}>
            <Link
              to={`/catalog/${cat.slug}`}
              className={`catalog-menu-item${active?.slug === cat.slug ? ' is-active' : ''}`}
              onMouseEnter={() => setActiveSlug(cat.slug)}
              onFocus={() => setActiveSlug(cat.slug)}
              onClick={onClose}
            >
              {cat.name}
              {cat.subcategories.length > 0 && <ChevronRight size={18} />}
            </Link>
          </li>
        ))}
      </ul>
      {active?.subcategories.length > 0 && (
        <ul className="catalog-menu-sub">
          {active.subcategories.map((sub) => (
            <li key={sub}>
              <Link to={`/catalog/${active.slug}`} onClick={onClose}>
                {sub}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Header({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const loggedIn = useAuth();
  const profile = useProfile();
  const location = useLocation();

  // Keep the box showing the search the catalog is displaying (and empty it elsewhere).
  useEffect(() => {
    const q = location.pathname.startsWith('/catalog') ? new URLSearchParams(location.search).get('q') : '';
    setQuery(q ?? '');
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
  };

  return (
    <header className="site-header">
      <div className="container header-top">
        <BrandLogo />

        <div className="header-catalog" ref={menuRef}>
          <button
            type="button"
            className="btn-catalog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon />
            Каталог
          </button>
          {menuOpen && <CatalogMenu onClose={() => setMenuOpen(false)} />}
        </div>

        <form className="header-search" role="search" onSubmit={handleSearch}>
          <SearchIcon />
          <input
            type="search"
            placeholder="Знайти книгу"
            aria-label="Пошук книги"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Знайти</button>
        </form>

        <div className="header-contacts">
          <a href="tel:+380681236787">
            <PhoneIcon size={14} /> (068) 123 67 87
          </a>
          <span>9-21 (пн-пт), 10-19(сб)</span>
        </div>

        <div className="header-actions">
          {profile?.isAdmin && (
            <Link to="/admin" className="header-admin">
              Адмін
            </Link>
          )}
          <Link to={loggedIn ? '/profile' : '/sign-in'} className="icon-btn" aria-label="Особистий кабінет">
            {profile?.avatarUrl ? <img className="header-avatar" src={profile.avatarUrl} alt="" /> : <UserIcon />}
          </Link>
          <button type="button" className="icon-btn" aria-label="Обране">
            <HeartIcon />
          </button>
          <Link to="/cart" className="icon-btn" aria-label={`Кошик, товарів: ${cartCount}`}>
            <CartIcon />
            <span className="icon-btn-badge">{cartCount}</span>
          </Link>
        </div>
      </div>

      <nav className="container header-nav" aria-label="Розділи">
        {NAV_LINKS.map((link) => (
          <a key={link} href="#" className="nav-pill">
            {link}
          </a>
        ))}
      </nav>
    </header>
  );
}
