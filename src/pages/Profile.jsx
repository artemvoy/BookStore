import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { changePassword, getProfile, logout, updateProfile } from '../api.js';
import TextField from '../components/TextField.jsx';
import { ChevronRight } from '../components/icons.jsx';
import useAuth from '../useAuth.js';

function Status({ status }) {
  if (!status) return null;
  return (
    <p className={`form-status form-status--${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
      {status.text}
    </p>
  );
}

function PersonalData({ profile, onSaved }) {
  const [form, setForm] = useState({ firstName: profile.firstName ?? '', lastName: profile.lastName ?? '' });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setStatus(null);
  };

  const unchanged = form.firstName.trim() === (profile.firstName ?? '') && form.lastName.trim() === (profile.lastName ?? '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = { firstName: form.firstName.trim(), lastName: form.lastName.trim() };
    setSaving(true);
    try {
      await updateProfile(next);
      onSaved(next);
      setStatus({ type: 'ok', text: 'Дані збережено' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h2 className="panel-title">Особисті дані</h2>
      <div className="panel-fields">
        <div className="auth-row">
          <TextField label="Прізвище" autoComplete="family-name" value={form.lastName} onChange={update('lastName')} />
          <TextField label="Ім'я" autoComplete="given-name" value={form.firstName} onChange={update('firstName')} />
        </div>
        <TextField label="Email" type="email" value={profile.email} readOnly disabled />
      </div>
      <Status status={status} />
      <button type="submit" className="btn-primary" disabled={unchanged || saving}>
        {saving ? 'Збереження…' : 'Зберегти'}
      </button>
    </form>
  );
}

const EMPTY_PASSWORDS = { current: '', next: '', confirm: '' };

function PasswordForm() {
  const [form, setForm] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
    setStatus(null);
  };

  const filled = Object.values(form).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (form.next.length < 8) found.next = 'Пароль має містити щонайменше 8 символів';
    if (form.confirm !== form.next) found.confirm = 'Паролі не співпадають';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await changePassword(form.current, form.next);
      setForm(EMPTY_PASSWORDS);
      setStatus({ type: 'ok', text: 'Пароль змінено' });
    } catch (err) {
      if (err.status === 400) setErrors({ current: 'Поточний пароль невірний' });
      else setStatus({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h2 className="panel-title">Зміна паролю</h2>
      <div className="panel-fields">
        <TextField
          label="Поточний пароль"
          type="password"
          autoComplete="current-password"
          value={form.current}
          onChange={update('current')}
          error={errors.current}
        />
        <TextField
          label="Новий пароль"
          type="password"
          autoComplete="new-password"
          value={form.next}
          onChange={update('next')}
          error={errors.next}
        />
        <TextField
          label="Повторіть новий пароль"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update('confirm')}
          error={errors.confirm}
        />
      </div>
      <Status status={status} />
      <button type="submit" className="btn-primary" disabled={!filled || saving}>
        {saving ? 'Збереження…' : 'Змінити пароль'}
      </button>
    </form>
  );
}

export default function Profile() {
  const loggedIn = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loggedIn) return;
    getProfile()
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, [loggedIn]);

  if (!loggedIn) return <Navigate to="/sign-in" replace state={{ from: '/profile' }} />;

  const handleLogout = async () => {
    await logout().catch(() => {});
    navigate('/');
  };

  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');

  return (
    <div className="profile-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навігація">
          <Link to="/">Головна</Link>
          <ChevronRight size={14} />
          <span aria-current="page">Особистий кабінет</span>
        </nav>
        <div className="profile-head">
          <div>
            <h1 className="page-title">Особистий кабінет</h1>
            {profile && <p className="profile-greeting">Вітаємо{name ? `, ${name}` : ''}!</p>}
          </div>
          <button type="button" className="btn-outline-accent" onClick={handleLogout}>
            Вийти
          </button>
        </div>

        {error && <p className="catalog-empty">{error}</p>}
        {!profile && !error && <p className="catalog-empty">Завантаження…</p>}
        {profile && (
          <div className="profile-grid">
            <PersonalData profile={profile} onSaved={(next) => setProfile((p) => ({ ...p, ...next }))} />
            <PasswordForm />
          </div>
        )}
      </div>
    </div>
  );
}
