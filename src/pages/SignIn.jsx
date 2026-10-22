import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal.jsx';
import Logo from '../components/Logo.jsx';
import TextField from '../components/TextField.jsx';
import { EMAIL_RE } from '../validation.js';

export default function SignIn() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const filled = form.email.trim() && form.password;
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(form.email.trim())) {
      setErrors({ email: 'Невірний формат email' });
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
          <button type="submit" className="btn" disabled={!filled || hasErrors}>
            Увійти
          </button>
          <p className="auth-switch">
            Немає акаунту? <Link to="/sign-up">Зареєструватись</Link>
          </p>
        </div>
      </form>
    </AuthModal>
  );
}
