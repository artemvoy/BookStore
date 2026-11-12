import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api.js';
import AuthModal from '../components/AuthModal.jsx';
import Logo from '../components/Logo.jsx';
import TextField from '../components/TextField.jsx';
import { EMAIL_RE } from '../validation.js';

export default function SignIn() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  // Pages that need an account send the user here with the place to come back to.
  const from = useLocation().state?.from ?? '/';

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
    setServerError('');
  };

  const filled = form.email.trim() && form.password;
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(form.email.trim())) {
      setErrors({ email: 'Невірний формат email' });
      return;
    }
    setSubmitting(true);
    setServerError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.status === 401 ? 'Невірний email або пароль' : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthModal>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <header className="auth-header">
          <Logo />
          <h1 className="auth-title">Вітаємо!</h1>
          <p className="auth-subtitle">Увійдіть в акаунт</p>
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
          <TextField
            label="Пароль"
            type="password"
            placeholder="Введіть пароль"
            autoComplete="current-password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
          />
          <Link className="auth-forgot" to="/forgot-password">
            Забули пароль?
          </Link>
        </div>

        <div className="auth-actions">
          {serverError && (
            <p className="field-error" role="alert">
              {serverError}
            </p>
          )}
          <button type="submit" className="btn" disabled={!filled || hasErrors || submitting}>
            {submitting ? 'Вхід…' : 'Увійти'}
          </button>
          <p className="auth-switch">
            Немає акаунту? <Link to="/sign-up">Зареєструватись</Link>
          </p>
        </div>
      </form>
    </AuthModal>
  );
}
