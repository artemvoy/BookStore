import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { changePassword, deleteAvatar, getProfile, logout, updateProfile, uploadAvatar } from '../api.js';
import TextField from '../components/TextField.jsx';
import { ChevronRight } from '../components/icons.jsx';
import useAuth from '../useAuth.js';
import { notifyProfileChange } from '../useProfile.js';

function Status({ status }) {
  if (!status) return null;
  return (
    <p className={`form-status form-status--${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
      {status.text}
    </p>
  );
}

const MAX_AVATAR = 5 * 1024 * 1024;

// Photo with "change"/"remove"; the backend stores the file and returns its URL.
function Avatar({ profile, onChange }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const initials = [profile.firstName, profile.lastName].map((p) => p?.[0] ?? '').join('') || profile.email[0];

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_AVATAR) {
      setStatus({ type: 'error', text: 'Файл має бути не більшим за 5 МБ' });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const { avatarUrl } = await uploadAvatar(file);
      onChange(avatarUrl);
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await deleteAvatar();
      onChange(null);
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="avatar-edit">
      {profile.avatarUrl ? (
        <img className="avatar avatar--large" src={profile.avatarUrl} alt="Ваше фото" />
      ) : (
        <span className="avatar avatar--large avatar--initials" aria-hidden="true">
          {initials.toUpperCase()}
        </span>
      )}
      <div className="avatar-edit-actions">
        <label className={`btn-primary avatar-upload${busy ? ' is-busy' : ''}`}>
          {busy ? 'Завантаження…' : profile.avatarUrl ? 'Змінити фото' : 'Додати фото'}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={handleFile} />
        </label>
        {profile.avatarUrl && (
          <button type="button" className="btn-outline-accent" disabled={busy} onClick={handleRemove}>
            Видалити
          </button>
        )}
        <small className="avatar-hint">JPG, PNG або WEBP, до 5 МБ</small>
        <Status status={status} />
      </div>
    </div>
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
      notifyProfileChange();
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
      <Avatar
        profile={profile}
        onChange={(avatarUrl) => {
          onSaved({ avatarUrl });
          notifyProfileChange();
        }}
      />
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
          <div className="profile-head-actions">
            {profile?.isAdmin && (
              <Link to="/admin" className="btn-primary">
                Панель адміністратора
              </Link>
            )}
            <button type="button" className="btn-outline-accent" onClick={handleLogout}>
              Вийти
            </button>
          </div>
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
