import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api.js';
import AuthModal from '../components/AuthModal.jsx';
import TextField from '../components/TextField.jsx';
import { EMAIL_RE } from '../validation.js';

function validate(form) {
  const errors = {};
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Невірний формат email';
  if (!form.token.trim()) errors.token = 'Введіть код з листа';
  if (form.password.length < 8) errors.password = 'Пароль має містити щонайменше 8 символів';
  if (form.confirm !== form.password) errors.confirm = 'Паролі не співпадають';
  return errors;
}

// Opened from the link in the reset email (?email=&token=); the code can also be pasted by hand.
export default function ResetPassword() {
  const [params] = useSearchParams();
  const linkToken = params.get('token') ?? '';
  const [form, setForm] = useState({ email: params.get('email') ?? '', token: linkToken, password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
    setServerError('');
  };

  const filled = Object.values(form).every((v) => v.trim() !== '');
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await resetPassword({ email: form.email.trim(), token: form.token.trim(), newPassword: form.password });
      setDone(true);
    } catch (err) {
      setServerError(err.status === 400 ? 'Посилання недійсне або термін його дії минув' : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthModal>
        <div className="auth-form">
          <header className="auth-header">
            <h1 className="auth-title auth-title--upper">Пароль змінено</h1>
            <p className="auth-subtitle auth-subtitle--small">Тепер ви можете увійти з новим паролем</p>
          </header>
          <div className="auth-actions">
            <Link className="btn" to="/sign-in">
              Увійти
            </Link>
          </div>
        </div>
      </AuthModal>
    );
  }

  return (
    <AuthModal>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <header className="auth-header">
          <h1 className="auth-title auth-title--upper">Новий пароль</h1>
          <p className="auth-subtitle auth-subtitle--small">Придумайте новий пароль для свого акаунту</p>
        </header>

        <div className="auth-fields">
          <TextField
            label="Email"
            type="email"
            placeholder="Введіть email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
          />
          {!linkToken && (
            <TextField
              label="Код з листа"
              placeholder="Вставте код відновлення"
              autoComplete="one-time-code"
              value={form.token}
              onChange={update('token')}
              error={errors.token}
            />
          )}
          <TextField
            label="Новий пароль"
            type="password"
            placeholder="Введіть новий пароль"
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
          />
          <TextField
            label="Повторіть пароль"
            type="password"
            placeholder="Повторіть пароль"
            autoComplete="new-password"
            value={form.confirm}
            onChange={update('confirm')}
            error={errors.confirm}
          />
        </div>

        <div className="auth-actions">
          {serverError && (
            <p className="field-error" role="alert">
              {serverError}
            </p>
          )}
          <button type="submit" className="btn" disabled={!filled || hasErrors || submitting}>
            {submitting ? 'Збереження…' : 'Змінити пароль'}
          </button>
          <p className="auth-switch">
            Згадали пароль? <Link to="/sign-in">Увійти</Link>
          </p>
        </div>
      </form>
    </AuthModal>
  );
}
