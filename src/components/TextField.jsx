import { useId, useState } from 'react';

function EyeIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      {!open && <path d="M4 4 L20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}

export default function TextField({ label, type = 'text', error, ...inputProps }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className={`field-control${error ? ' field-control--error' : ''}`}>
        <input
          id={id}
          className="field-input"
          type={isPassword && visible ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="field-eye"
            aria-label={visible ? 'Сховати пароль' : 'Показати пароль'}
            onClick={() => setVisible((v) => !v)}
          >
            <EyeIcon open={visible} />
          </button>
        )}
      </div>
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
