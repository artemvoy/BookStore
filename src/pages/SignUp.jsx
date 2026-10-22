import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const filled = Object.values(form).every((v) => v.trim() !== '');
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors(validate(form));
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
          <button type="submit" className="btn" disabled={!filled || hasErrors}>
            Зареєструватись
          </button>
          <p className="auth-switch">
            Вже є акаунт? <Link to="/sign-in">Увійти</Link>
          </p>
        </div>
      </form>
    </AuthModal>
  );
}
