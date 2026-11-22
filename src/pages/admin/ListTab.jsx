import { useEffect, useState } from 'react';
import AdminModal, { AdminField } from './AdminModal.jsx';

// Table + add/edit/delete for a simple resource (categories, authors).
// `fields`: [{ name, label, required?, multiline? }]; `load`/`api` talk to the backend;
// `title(item)` names an item in messages; `onChange` runs after every successful change.
export default function ListTab({ noun, fields, load, api, title, onChange }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);
  const tableFields = fields.filter((f) => !f.hideInTable);

  const refresh = () =>
    load()
      .then((list) => {
        setItems(list);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));

  useEffect(() => {
    refresh();
  }, []);

  const changed = (text) => {
    setMessage({ type: 'ok', text });
    refresh();
    onChange?.();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Видалити «${title(item)}»? Цю дію не можна скасувати.`)) return;
    try {
      await api.remove(item.id);
      changed(`«${title(item)}» видалено`);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <section>
      <div className="admin-toolbar">
        <span className="admin-count">Усього: {items.length}</span>
        <button type="button" className="btn-accent" onClick={() => setEditing({})}>
          + Додати {noun.accusative}
        </button>
      </div>

      {message && (
        <p className={`form-status form-status--${message.type} admin-message`} role="status">
          {message.text}
        </p>
      )}

      {status === 'error' ? (
        <p className="catalog-empty">Не вдалося завантажити дані.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {tableFields.map((f) => (
                  <th key={f.name}>{f.label}</th>
                ))}
                <th aria-label="Дії" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {tableFields.map((f) => (
                    <td key={f.name} className={f.multiline ? 'admin-muted' : undefined}>
                      {item[f.name] || '—'}
                    </td>
                  ))}
                  <td className="admin-actions">
                    <button type="button" onClick={() => setEditing(item)}>
                      Змінити
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(item)}>
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && status === 'ready' && (
                <tr>
                  <td colSpan={tableFields.length + 1} className="admin-muted">
                    Поки що порожньо
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ItemForm
          item={editing.id ? editing : null}
          noun={noun}
          fields={fields}
          api={api}
          onClose={() => setEditing(null)}
          onSaved={(isNew) => {
            setEditing(null);
            changed(isNew ? `${noun.capital} додано` : 'Зміни збережено');
          }}
        />
      )}
    </section>
  );
}

function ItemForm({ item, noun, fields, api, onClose, onSaved }) {
  const [form, setForm] = useState(() => Object.fromEntries(fields.map((f) => [f.name, item?.[f.name] ?? ''])));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    fields.forEach((f) => {
      if (f.required && !String(form[f.name]).trim()) found[f.name] = 'Обов’язкове поле';
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Optional fields go as null rather than an empty string.
    const data = Object.fromEntries(fields.map((f) => [f.name, String(form[f.name]).trim() || (f.required ? '' : null)]));
    setSaving(true);
    try {
      if (item) await api.update(item.id, data);
      else await api.create(data);
      onSaved(!item);
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  };

  return (
    <AdminModal title={item ? `Редагувати ${noun.accusative}` : `Нов${noun.newSuffix} ${noun.nominative}`} onClose={onClose}>
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="admin-form-fields">
          {fields.map((f, i) => (
            <AdminField key={f.name} label={f.required ? f.label : `${f.label} (необов'язково)`} error={errors[f.name]}>
              {f.multiline ? (
                <textarea
                  rows={4}
                  value={form[f.name]}
                  onChange={(e) => setForm((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              ) : (
                <input
                  value={form[f.name]}
                  autoFocus={i === 0}
                  onChange={(e) => {
                    setForm((v) => ({ ...v, [f.name]: e.target.value }));
                    setErrors((v) => ({ ...v, [f.name]: undefined }));
                  }}
                />
              )}
            </AdminField>
          ))}
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
