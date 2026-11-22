import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { adminAuthors, adminCategories, getAuthors, getCategories } from '../../api.js';
import { ChevronRight } from '../../components/icons.jsx';
import useAuth from '../../useAuth.js';
import { refreshCategories } from '../../useCategories.js';
import useProfile from '../../useProfile.js';
import BooksTab from './BooksTab.jsx';
import ListTab from './ListTab.jsx';

const TABS = [
  { id: 'books', label: 'Книги' },
  { id: 'categories', label: 'Категорії' },
  { id: 'authors', label: 'Автори' },
];

const CATEGORY_FIELDS = [
  { name: 'name', label: 'Назва', required: true },
  { name: 'description', label: 'Опис', multiline: true },
];

const AUTHOR_FIELDS = [
  { name: 'firstName', label: "Ім'я", required: true },
  { name: 'lastName', label: 'Прізвище', required: true },
  { name: 'photoUrl', label: 'Посилання на фото', hideInTable: true },
  { name: 'bio', label: 'Біографія', multiline: true },
];

// Catalog management for users listed in the backend's AdminEmails setting.
export default function Admin() {
  const loggedIn = useAuth();
  const profile = useProfile();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'books';

  if (!loggedIn) return <Navigate to="/sign-in" replace state={{ from: '/admin' }} />;

  let body;
  if (!profile) body = <p className="catalog-empty">Завантаження…</p>;
  else if (!profile.isAdmin)
    body = <p className="catalog-empty">Цей розділ доступний лише адміністраторам.</p>;
  else if (tab === 'books') body = <BooksTab />;
  else if (tab === 'categories')
    body = (
      <ListTab
        key="categories"
        noun={{ nominative: 'категорія', accusative: 'категорію', capital: 'Категорію', newSuffix: 'а' }}
        fields={CATEGORY_FIELDS}
        load={getCategories}
        api={adminCategories}
        title={(c) => c.name}
        onChange={refreshCategories}
      />
    );
  else
    body = (
      <ListTab
        key="authors"
        noun={{ nominative: 'автор', accusative: 'автора', capital: 'Автора', newSuffix: 'ий' }}
        fields={AUTHOR_FIELDS}
        load={getAuthors}
        api={adminAuthors}
        title={(a) => `${a.firstName} ${a.lastName}`}
      />
    );

  return (
    <div className="admin-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навігація">
          <Link to="/">Головна</Link>
          <ChevronRight size={14} />
          <span aria-current="page">Адміністрування</span>
        </nav>
        <h1 className="page-title">Адміністрування</h1>

        {profile?.isAdmin && (
          <div className="admin-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={t.id === tab}
                className={t.id === tab ? 'is-active' : undefined}
                onClick={() => setParams(t.id === 'books' ? {} : { tab: t.id })}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {body}
      </div>
    </div>
  );
}
