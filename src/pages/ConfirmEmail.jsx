import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { confirmEmail } from '../api.js';
import AuthModal from '../components/AuthModal.jsx';
import ResendConfirmation from '../components/ResendConfirmation.jsx';

// Opened from the link in the sign-up email: /confirm-email?email=…&token=…
export default function ConfirmEmail() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const token = params.get('token') ?? '';
  const [state, setState] = useState({ status: 'pending' });
  // The token is single-use, so StrictMode's double effect must not send it twice.
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    if (!email || !token) {
      setState({ status: 'error', message: 'У посиланні бракує даних. Відкрийте його з листа ще раз.' });
      return;
    }
    confirmEmail(email, token)
      .then(() => setState({ status: 'ok' }))
      .catch((err) => setState({ status: 'error', message: err.message }));
  }, [email, token]);

  return (
    <AuthModal>
      <div className="auth-form">
        <header className="auth-header">
          <h1 className="auth-title auth-title--upper">
            {state.status === 'ok' ? 'Пошту підтверджено' : state.status === 'error' ? 'Не вдалося підтвердити' : 'Підтвердження…'}
          </h1>
          <p className="auth-subtitle auth-subtitle--small">
            {state.status === 'ok'
              ? 'Дякуємо! Тепер ви можете увійти у свій акаунт.'
              : state.status === 'error'
                ? state.message
                : 'Перевіряємо посилання з листа'}
          </p>
        </header>
        <div className="auth-actions">
          {state.status === 'ok' && (
            <Link className="btn" to="/sign-in">
              Увійти
            </Link>
          )}
          {state.status === 'error' && (
            <>
              <ResendConfirmation email={email} />
              <p className="auth-switch">
                Вже підтвердили? <Link to="/sign-in">Увійти</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </AuthModal>
  );
}
