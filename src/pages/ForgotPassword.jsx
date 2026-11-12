import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import AuthModal from '../components/AuthModal.jsx';
import TextField from '../components/TextField.jsx';
import { EMAIL_RE } from '../validation.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError('Невірний формат email');
      return;
    }
    setSubmitting(true);
    try {
      await api('/account/forgot-password', { method: 'POST', body: { email: email.trim() } });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthModal>
        <div className="auth-form">
          <header className="auth-header">
            <h1 className="auth-title auth-title--upper">Перевірте пошту</h1>
            <p className="auth-subtitle auth-subtitle--small">
              Якщо {email.trim()} зареєстрований, на нього надіслано лист з інструкцією для відновлення паролю
            </p>
          </header>
          <div className="auth-actions">
            <Link className="btn" to={`/reset-password?email=${encodeURIComponent(email.trim())}`}>
              У мене є код з листа
            </Link>
            <p className="auth-switch">
              <Link to="/sign-in">Повернутись до входу</Link>
            </p>
          </div>
        </div>
      </AuthModal>
    );
  }

  return (
    <AuthModal>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <header className="auth-header">
          <h1 className="auth-title auth-title--upper">Відновлення паролю</h1>
          <p className="auth-subtitle auth-subtitle--small">
            Введіть свій Email на який буде відправлений лист з інформацією для відновлення паролю
          </p>
        </header>

        <div className="auth-fields">
          <TextField
            label="Email"
            type="email"
            placeholder="Введіть email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
            error={error}
          />
        </div>

        <div className="auth-actions">
          <button type="submit" className="btn" disabled={!email.trim() || Boolean(error) || submitting}>
            {submitting ? 'Надсилання…' : 'Відновити пароль'}
          </button>
          <p className="auth-switch">
            Згадали пароль? <Link to="/sign-in">Увійти</Link>
          </p>
        </div>
      </form>
    </AuthModal>
  );
}
