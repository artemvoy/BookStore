import { useState } from 'react';
import { resendConfirmation } from '../api.js';

// "Надіслати лист ще раз" with its own status line; used after sign-up, on a blocked sign-in and on a dead link.
export default function ResendConfirmation({ email }) {
  const [status, setStatus] = useState(null);

  const handleClick = async () => {
    setStatus({ type: 'pending' });
    try {
      await resendConfirmation(email);
      setStatus({ type: 'ok', text: 'Лист надіслано ще раз. Перевірте також папку «Спам».' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="resend">
      <button type="button" className="resend-button" disabled={!email || status?.type === 'pending'} onClick={handleClick}>
        {status?.type === 'pending' ? 'Надсилання…' : 'Надіслати лист ще раз'}
      </button>
      {status?.text && (
        <p className={`form-status form-status--${status.type}`} role="status">
          {status.text}
        </p>
      )}
    </div>
  );
}
