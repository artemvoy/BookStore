import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminBooks, getAuthors, getBooks, getCategories } from '../../api.js';
import BookCover from '../../components/BookCover.jsx';
import Pagination from '../../components/Pagination.jsx';
import { SearchIcon } from '../../components/icons.jsx';
import AdminModal, { AdminField } from './AdminModal.jsx';

const PAGE_SIZE = 10;
const EMPTY = { title: '', description: '', price: '', stock: '', coverImageUrl: '', categoryId: '', authorId: '' };

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Введіть назву';
  // The backend rejects an empty description (non-nullable string).
  if (!form.description.trim()) errors.description = 'Введіть опис';
  if (form.price === '' || Number(form.price) < 0) errors.price = 'Ціна має бути 0 або більше';
  if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)
    errors.stock = 'Ціле число, 0 або більше';
  if (!form.categoryId) errors.categoryId = 'Оберіть категорію';
  if (!form.authorId) errors.authorId = 'Оберіть автора';
  return errors;
}

function BookForm({ book, categories, authors, onSaved, onClose }) {
  const [form, setForm] = useState(
    book
      ? {
          title: book.title,
          description: book.description ?? '',
          price: String(book.price),
          stock: String(book.stock),
          coverImageUrl: book.image ?? '',
          categoryId: String(book.categoryId),
          authorId: String(book.authorId),
        }
      : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stockQuantity: Number(form.stock),
      coverImageUrl: form.coverImageUrl.trim() || null,
      categoryId: Number(form.categoryId),
      authorId: Number(form.authorId),
    };
    setSaving(true);
    setServerError('');
    try {
      if (book) await adminBooks.update(book.id, data);
      else await adminBooks.create(data);
      onSaved();
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  };

  const preview = { title: form.title || 'Назва', author: '', image: form.coverImageUrl.trim(), cover: ['#2b1a3d', '#ff2e8a'] };

  return (
    <AdminModal title={book ? 'Редагувати книгу' : 'Нова книга'} onClose={onClose}>
      <form className="admin-form admin-form--book" onSubmit={handleSubmit} noValidate>
        <div className="admin-form-cover">
          <BookCover book={preview} />
        </div>
        <div className="admin-form-fields">
          <AdminField label="Назва" error={errors.title}>
            <input value={form.title} onChange={update('title')} autoFocus />
          </AdminField>
          <div className="admin-form-row">
            <AdminField label="Автор" error={errors.authorId}>
              <select value={form.authorId} onChange={update('authorId')}>
                <option value="">— оберіть —</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Категорія" error={errors.categoryId}>
              <select value={form.categoryId} onChange={update('categoryId')}>
                <option value="">— оберіть —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          <div className="admin-form-row">
            <AdminField label="Ціна, грн" error={errors.price}>
              <input type="number" min="0" step="0.01" value={form.price} onChange={update('price')} />
            </AdminField>
            <AdminField label="Кількість на складі" error={errors.stock}>
              <input type="number" min="0" step="1" value={form.stock} onChange={update('stock')} />
            </AdminField>
          </div>
          <AdminField label="Посилання на обкладинку (необов'язково)">
            <input value={form.coverImageUrl} onChange={update('coverImageUrl')} placeholder="https://… або /books/…" />
          </AdminField>
          <AdminField label="Опис" error={errors.description}>
            <textarea rows={5} value={form.description} onChange={update('description')} />
          </AdminField>
          {serverError && (
            <p className="form-status form-status--error" role="alert">
              {serverError}
            </p>
          )}
          <div className="admin-form-actions">
            <button type="button" className="btn-outline-accent" onClick={onClose}>
              Скасувати
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Збереження…' : 'Зберегти'}
            </button>
          </div>
        </div>
      </form>
    </AdminModal>
  );
}

export default function BooksTab() {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], totalItems: 0, totalPages: 0 });
  const [status, setStatus] = useState('loading');
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [editing, setEditing] = useState(null); // null = closed, {} = new book, book = edit
  const [reload, setReload] = useState(0);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getAuthors().then(setAuthors).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    getBooks({ searchTerm: term, page, pageSize: PAGE_SIZE })
      .then((data) => {
        if (!alive) return;
        // Deleting the last book on a page leaves it empty; step back one page.
        if (data.items.length === 0 && page > 1) setPage(page - 1);
        setResult(data);
        setStatus('ready');
      })
      .catch(() => alive && setStatus('error'));
    return () => {
      alive = false;
    };
  }, [term, page, reload]);

  const handleSearch = (e) => {
    e.preventDefault();
    setTerm(search.trim());
    setPage(1);
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Видалити книгу «${book.title}»? Цю дію не можна скасувати.`)) return;
    try {
      await adminBooks.remove(book.id);
      setMessage({ type: 'ok', text: `Книгу «${book.title}» видалено` });
      setReload((r) => r + 1);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSaved = () => {
    setMessage({ type: 'ok', text: editing?.id ? 'Зміни збережено' : 'Книгу додано' });
    setEditing(null);
    setReload((r) => r + 1);
  };

  return (
    <section>
      <div className="admin-toolbar">
        <form className="admin-search" role="search" onSubmit={handleSearch}>
          <SearchIcon size={16} />
          <input
            type="search"
            placeholder="Пошук за назвою або автором"
            aria-label="Пошук книг"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Знайти</button>
        </form>
        <span className="admin-count">Книг: {result.totalItems}</span>
        <button type="button" className="btn-accent" onClick={() => setEditing({})}>
          + Додати книгу
        </button>
      </div>

      {message && (
        <p className={`form-status form-status--${message.type} admin-message`} role="status">
          {message.text}
        </p>
      )}

      {status === 'error' ? (
        <p className="catalog-empty">Не вдалося завантажити книги.</p>
      ) : result.items.length === 0 && status === 'ready' ? (
        <p className="catalog-empty">Книг не знайдено.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className={`admin-table${status === 'loading' ? ' is-loading' : ''}`}>
            <thead>
              <tr>
                <th aria-label="Обкладинка" />
                <th>Назва</th>
                <th>Автор</th>
                <th>Категорія</th>
                <th className="num">Ціна</th>
                <th className="num">Склад</th>
                <th aria-label="Дії" />
              </tr>
            </thead>
            <tbody>
              {result.items.map((book) => (
                <tr key={book.id}>
                  <td className="admin-thumb">
                    <BookCover book={book} />
                  </td>
                  <td>
                    <Link to={`/book/${book.id}`} className="admin-link">
                      {book.title}
                    </Link>
                  </td>
                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td className="num">{book.price} грн</td>
                  <td className={`num${book.stock === 0 ? ' out-of-stock' : ''}`}>{book.stock}</td>
                  <td className="admin-actions">
                    <button type="button" onClick={() => setEditing(book)}>
                      Змінити
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(book)}>
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />

      {editing && (
        <BookForm
          book={editing.id ? editing : null}
          categories={categories}
          authors={authors}
          onSaved={handleSaved}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}
