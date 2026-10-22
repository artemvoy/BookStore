import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal.jsx';
import TextField from '../components/TextField.jsx';
import { EMAIL_RE } from '../validation.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError('Невірний формат email');
    }
  };

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
          <button type="submit" className="btn" disabled={!email.trim() || Boolean(error)}>
            Відновити пароль
          </button>
          <p className="auth-switch">
            Згадали пароль? <Link to="/sign-in">Увійти</Link>
          </p>
        </div>
      </form>
    </AuthModal>
  );
}
