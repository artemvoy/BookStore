import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isLoggedIn, register } from '../api.js';
import AuthModal from '../components/AuthModal.jsx';
import Logo from '../components/Logo.jsx';
import TextField from '../components/TextField.jsx';
import { EMAIL_RE } from '../validation.js';

const EMPTY = { lastName: '', firstName: '', email: '', password: '', confirm: '' };

function validate(form) {
  const errors = {};
  if (!form.lastName.trim()) errors.lastName = 'Введіть прізвище';
  if (!form.firstName.trim()) errors.firstName = "Введіть ім'я";
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Невірний формат email';
  if (form.password.length < 8) errors.password = 'Пароль має містити щонайменше 8 символів';
  if (form.confirm !== form.password) errors.confirm = 'Паролі не співпадають';
  return errors;
}

export default function SignUp() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
    setServerError('');
    try {
      const result = await register({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      // Account created either way; if the name wasn't saved, the profile page lets the user add it.
      if (result.complete) navigate('/');
      else navigate(isLoggedIn() ? '/profile' : '/sign-in');
    } catch (err) {
      setServerError(err.status === 400 ? 'Користувач з таким email вже існує' : err.message);
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
          <p className="auth-subtitle">Зареєструйте акаунт</p>
        </header>

        <div className="auth-fields">
          <div className="auth-row">
            <TextField
              label="Прізвище"
              placeholder="Введіть ваше прізвище"
              autoComplete="family-name"
              value={form.lastName}
              onChange={update('lastName')}
              error={errors.lastName}
            />
            <TextField
              label="Ім'я"
              placeholder="Введіть ваше ім'я"
              autoComplete="given-name"
              value={form.firstName}
              onChange={update('firstName')}
              error={errors.firstName}
            />
          </div>
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
            {submitting ? 'Реєстрація…' : 'Зареєструватись'}
          </button>
          <p className="auth-switch">
            Вже є акаунт? <Link to="/sign-in">Увійти</Link>
          </p>
        </div>
      </form>
    </AuthModal>
  );
}
